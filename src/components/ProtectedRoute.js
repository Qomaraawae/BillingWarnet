function ProtectedRoute({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        // Redirect to login if not authenticated
        navigate("/admin/login");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gray-50 flex items-center justify-center"
      >
        <motion.div
          animate={{
            rotate: 360,
            transition: {
              repeat: Infinity,
              duration: 1,
              ease: "linear",
            },
          }}
          className="h-16 w-16 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </motion.div>
    );
  }

  return user ? children : null;
}
