export const calculatePercentChange = (oldValue, newValue) => {
    if (oldValue === 0) {
      throw new Error("Old value cannot be zero to avoid division by zero.");
    }
    const percentChange = ((newValue - oldValue) / oldValue) * 100;
    return percentChange;
  };
  
  // Example usage
