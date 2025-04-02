export const checkPremiumStatus = async () => {
    const isPremium = await AsyncStorage.getItem('isPremium')? true : false;

    return isPremium === 'true';
  };
  