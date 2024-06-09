// FadeOutComponent.js
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface FadeOutProps {
  isVisible: boolean;
  children: React.ReactNode;
}
export default function FadeOut({ isVisible, children }: FadeOutProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }} // Adjust the duration as needed
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
