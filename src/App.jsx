import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import FileStoreList from "./components/FileStoreList";
import FileStoreDetail from "./components/FileStoreDetail";
import Files from "./components/Files";
import "./App.css";

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        <Routes location={location}>
          <Route path="/" element={<FileStoreList />} />
          <Route path="/store/:storeName" element={<FileStoreDetail />} />
          <Route path="/files" element={<Files />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

function App() {
  return (
    <Router>
      <div className="app">
        <motion.header
          className="app-header"
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
            }}
          >
            <Link to="/" className="app-title">
              <motion.h1
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                Google File Manager
              </motion.h1>
            </Link>
            <nav style={{ display: "flex", gap: "1rem" }}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/"
                  style={{
                    color: "white",
                    textDecoration: "none",
                    padding: "0.5rem 1rem",
                    borderRadius: "4px",
                    background: "rgba(255,255,255,0.1)",
                  }}
                >
                  Stores
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/files"
                  style={{
                    color: "white",
                    textDecoration: "none",
                    padding: "0.5rem 1rem",
                    borderRadius: "4px",
                    background: "rgba(255,255,255,0.1)",
                  }}
                >
                  Files
                </Link>
              </motion.div>
            </nav>
          </div>
        </motion.header>
        <motion.main
          className="app-main"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <AnimatedRoutes />
        </motion.main>
      </div>
    </Router>
  );
}

export default App;
