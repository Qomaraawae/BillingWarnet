import { create } from "zustand";
import { db } from "../FirebaseConfig";
import {
  collection,
  addDoc,
  updateDoc,
  getDoc,
  doc,
  getDocs,
  deleteDoc,
} from "firebase/firestore";

const packages = [
  { id: "1h", name: "1 Hour", time: 60, price: 5000 },
  { id: "2h", name: "2 Hours", time: 120, price: 9000 },
  { id: "3h", name: "3 Hours", time: 180, price: 12000 },
  { id: "5h", name: "5 Hours", time: 300, price: 18000 },
];

const BillingStore = create((set, get) => ({
  users: [],
  packages,
  payments: [],
  loading: false,
  error: null,

  fetchUsers: async () => {
    try {
      set({ loading: false, error: null });
      const querySnapshot = await getDocs(collection(db, "users"));
      const usersData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      set({ users: usersData });
    } catch (error) {
      set({ error: "Failed to fetch users" });
    } finally {
      set({ loading: false });
    }
  },

  addUser: async (name, selectedPackage) => {
    try {
      set({ loading: true, error: null });
      const startTime = new Date().toISOString();
      const endTime = new Date(
        Date.now() + selectedPackage.time * 60 * 1000
      ).toISOString();
      const remainingTime = selectedPackage.time * 60; // Dalam detik

      const newUser = {
        name,
        time: selectedPackage.time,
        price: selectedPackage.price,
        packageName: selectedPackage.name,
        startTime,
        endTime,
        remainingTime,
        paymentStatus: "Not Paid",
      };

      const docRef = await addDoc(collection(db, "users"), newUser);
      set((state) => ({
        users: [...state.users, { id: docRef.id, ...newUser }],
      }));
    } catch (error) {
      set({ error: "Failed to add user" });
    } finally {
      set({ loading: false });
    }
  },

  removeUser: async (userId) => {
    try {
      set({ loading: false, error: null });
      await deleteDoc(doc(db, "users", userId));
      set((state) => ({
        users: state.users.filter((user) => user.id !== userId),
      }));
    } catch (error) {
      set({ error: "Failed to remove user" });
    } finally {
      set({ loading: false });
    }
  },

  extendTime: async (userId, selectedPackage) => {
    try {
      set({ loading: true, error: null });
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) throw new Error("User not found");

      const userData = userSnap.data();
      const currentEndTime = userData.endTime
        ? new Date(userData.endTime)
        : new Date();
      const newEndTime = new Date(
        currentEndTime.getTime() + selectedPackage.time * 60000
      );

      await updateDoc(userRef, {
        endTime: newEndTime.toISOString(),
        time: userData.time + selectedPackage.time,
        price: userData.price + selectedPackage.price,
        packageName: `${userData.packageName} + ${selectedPackage.name}`,
      });

      set((state) => ({
        users: state.users.map((u) =>
          u.id === userId
            ? {
                ...u,
                endTime: newEndTime.toISOString(),
                time: u.time + selectedPackage.time,
                price: u.price + selectedPackage.price,
                packageName: `${u.packageName} + ${selectedPackage.name}`,
              }
            : u
        ),
      }));
    } catch (error) {
      set({ error: "Failed to extend time" });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  makePayment: async (userId, amount) => {
    try {
      set({ loading: true, error: null });
      const user = get().users.find((u) => u.id === userId);
      if (!user) throw new Error("Pengguna tidak ditemukan");

      const newPayment = {
        userId,
        customerName: user.name, // Simpan nama pelanggan
        userData: {
          // Simpan data lengkap pelanggan
          name: user.name,
          package: user.packageName,
          duration: user.time,
        },
        amountPaid: amount,
        paymentMethod: "QRIS",
        date: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, "payments"), newPayment);

      set((state) => ({
        payments: [{ id: docRef.id, ...newPayment }, ...state.payments],
      }));

      return docRef.id;
    } catch (error) {
      set({ error: "Gagal memproses pembayaran" });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  completeSession: async (userId) => {
    try {
      set({ loading: true });
      await updateDoc(doc(db, "users", userId), {
        status: "completed",
        endTime: new Date().toISOString(),
        paymentStatus: "pending_payment",
      });
    } catch (error) {
      set({ error: "Gagal menyelesaikan sesi" });
    } finally {
      set({ loading: false });
    }
  },

  completePayment: async (userId) => {
    try {
      set({ loading: true });
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        throw new Error("Pengguna tidak ditemukan");
      }

      const userData = userSnap.data();
      const transactionData = {
        ...userData,
        customerName: userData.name, // Simpan nama pelanggan
        userId: userSnap.id,
        paymentTime: new Date().toISOString(),
        paymentMethod: "QRIS",
        status: "completed",
        amount: userData.price,
      };

      await addDoc(collection(db, "transactions"), transactionData);
      await deleteDoc(userRef);

      set((state) => ({
        users: state.users.filter((user) => user.id !== userId),
        payments: [transactionData, ...state.payments],
      }));
    } catch (error) {
      set({ error: error.message || "Gagal menyelesaikan transaksi" });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  fetchPayments: async () => {
    try {
      set({ loading: false, error: null });

      // Ambil data dari koleksi payments
      const paymentsSnapshot = await getDocs(collection(db, "payments"));
      const paymentsData = paymentsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Ambil data dari koleksi transactions
      const transactionsSnapshot = await getDocs(
        collection(db, "transactions")
      );
      const transactionsData = transactionsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        isTransaction: true,
      }));

      // Gabungkan dan urutkan berdasarkan tanggal
      const allPayments = [...paymentsData, ...transactionsData].sort(
        (a, b) => {
          const dateA = a.date || a.paymentTime;
          const dateB = b.date || b.paymentTime;
          return new Date(dateB) - new Date(dateA);
        }
      );

      set({ payments: allPayments });
    } catch (error) {
      set({ error: "Gagal mengambil data transaksi" });
      console.error("Error fetching payments:", error);
    } finally {
      set({ loading: false });
    }
  },
}));

export default BillingStore;
