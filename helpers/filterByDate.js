export function filterByDate(tokenArray, tokenAge) {
  // Get the current date
  const now = new Date();

  // Helper function to calculate past dates
  const getPastDate = (date, offset) => {
    const pastDate = new Date(date);
    pastDate.setDate(pastDate.getDate() - offset);
    return pastDate;
  };

  // Calculate intervals
  const oneYearAgo = getPastDate(now, 365);
  const sixMonthsAgo = getPastDate(now, 30 * 6); // Approximation for 6 months
  const threeMonthsAgo = getPastDate(now, 30 * 3); // Approximation for 3 months
  const oneMonthAgo = getPastDate(now, 30); // Approximation for 1 month
  const oneWeekAgo = getPastDate(now, 7);
  const oneDayAgo = getPastDate(now, 1);

  // Filter based on the tokenAge parameter
  let filteredArray;

  if (tokenAge === "day") {
    
    return (filteredArray = tokenArray.filter(
      (token) => {
        const tokenDate = new Date(token.minted_at);
        return tokenDate >= oneDayAgo && tokenDate < now && token.daily_volume !== null && token.daily_volume > 2000000
      }
    ));
  }
  if (tokenAge === "week") {
   
    return (filteredArray = tokenArray.filter(
      (token) => new Date(token.minted_at) > oneWeekAgo && token.minted_at!== null && token.daily_volume !== null && token.daily_volume > 2000000
    ));
  }
  if (tokenAge === "month") {
  
    return (filteredArray = tokenArray.filter(
      (token) => new Date(token.minted_at) > oneMonthAgo && token.minted_at!== null && token.daily_volume !== null && token.daily_volume > 2000000
    ));
  }
  if (tokenAge === "three months") {
    
    return (filteredArray = tokenArray.filter(
      (token) => new Date(token.minted_at) > threeMonthsAgo && token.minted_at!== null && token.daily_volume !== null && token.daily_volume > 2000000
    ));
  }
  if (tokenAge === "six months") {
    
    return (filteredArray = tokenArray.filter(
      (token) => new Date(token.minted_at) > sixMonthsAgo && token.minted_at !== null && token.daily_volume !== null && token.daily_volume > 2000000
    ));
  }
  if (tokenAge === "year") {
    
    return (filteredArray = tokenArray.filter(
      (token) => new Date(token.minted_at) > oneYearAgo && token.minted_at !== null && token.daily_volume !== null && token.daily_volume > 2000000
    ));
  }

  console.log("No valid tokenAge provided");
  return tokenArray; // Return unfiltered array if no valid tokenAge is matched
}
