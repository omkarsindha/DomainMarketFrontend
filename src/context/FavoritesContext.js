import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FAVORITES_STORAGE_KEY = '@user_domain_favorites';
const FavoritesContext = createContext(null);

export function useFavorites() {
    const context = useContext(FavoritesContext);
    if (!context) {
        throw new Error('useFavorites must be used within a FavoritesProvider');
    }
    return context;
}

export function FavoritesProvider({ children }) {
    const [favorites, setFavorites] = useState([]);
    const [isLoadingFavorites, setIsLoadingFavorites] = useState(true);

    useEffect(() => {
        const loadFavoritesFromStorage = async () => {
            setIsLoadingFavorites(true);
            try {
                const storedFavoritesJson = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
                if (storedFavoritesJson !== null) {
                    setFavorites(JSON.parse(storedFavoritesJson));
                } else {
                    setFavorites([]);
                }
            } catch (e) {
                console.error("FavoritesContext: Failed to load favorites from storage", e);
                setFavorites([]);
            } finally {
                setIsLoadingFavorites(false);
            }
        };

        loadFavoritesFromStorage();
    }, []);

    useEffect(() => {
        const saveFavoritesToStorage = async () => {
            if (!isLoadingFavorites) {
                try {
                    await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
                } catch (e) {
                    console.error("FavoritesContext: Failed to save favorites to storage", e);
                }
            }
        };
        saveFavoritesToStorage();
    }, [favorites, isLoadingFavorites]);


    const toggleFavorite = useCallback((domainItem) => {
        if (!domainItem || typeof domainItem.domain !== 'string') {
            console.warn("FavoritesContext: Invalid domainItem passed to toggleFavorite", domainItem);
            return;
        }

        setFavorites(prevFavorites => {
            const isCurrentlyFavorite = prevFavorites.some(fav => fav.domain === domainItem.domain);
            if (isCurrentlyFavorite) {
                return prevFavorites.filter(fav => fav.domain !== domainItem.domain);
            } else {
                if (!prevFavorites.some(fav => fav.domain === domainItem.domain)) {
                    return [...prevFavorites, domainItem];
                }
                return prevFavorites;
            }
        });
    }, []);

    const isFavorite = useCallback((domainName) => {
        if (typeof domainName !== 'string') return false;
        return favorites.some(fav => fav.domain === domainName);
    }, [favorites]);

    const value = {
        favorites,
        toggleFavorite,
        isFavorite,
        isLoadingFavorites,
    };

    return (
        <FavoritesContext.Provider value={value}>
            {children}
        </FavoritesContext.Provider>
    );
}