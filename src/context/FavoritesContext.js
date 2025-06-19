// src/context/FavoritesContext.js
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FAVORITES_STORAGE_KEY = '@user_domain_favorites'; // Use a good key
const FavoritesContext = createContext(null);

export function useFavorites() {
    const context = useContext(FavoritesContext);
    if (!context) {
        throw new Error('useFavorites must be used within a FavoritesProvider');
    }
    return context;
}

export function FavoritesProvider({ children }) {
    const [favorites, setFavorites] = useState([]); // Array of domain items
    const [isLoadingFavorites, setIsLoadingFavorites] = useState(true);

    // Load favorites from AsyncStorage on initial mount
    useEffect(() => {
        const loadFavoritesFromStorage = async () => {
            setIsLoadingFavorites(true);
            try {
                const storedFavoritesJson = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
                if (storedFavoritesJson !== null) {
                    setFavorites(JSON.parse(storedFavoritesJson));
                } else {
                    setFavorites([]); // Initialize with empty array if nothing stored
                }
            } catch (e) {
                console.error("FavoritesContext: Failed to load favorites from storage", e);
                setFavorites([]); // Fallback to empty on error
            } finally {
                setIsLoadingFavorites(false);
            }
        };

        loadFavoritesFromStorage();
    }, []);

    // Persist favorites to AsyncStorage whenever the favorites state changes
    useEffect(() => {
        const saveFavoritesToStorage = async () => {
            // Don't save during initial load if favorites haven't been set yet from storage
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
        // Ensure domainItem and domainItem.domain exist
        if (!domainItem || typeof domainItem.domain !== 'string') {
            console.warn("FavoritesContext: Invalid domainItem passed to toggleFavorite", domainItem);
            return;
        }

        setFavorites(prevFavorites => {
            const isCurrentlyFavorite = prevFavorites.some(fav => fav.domain === domainItem.domain);
            if (isCurrentlyFavorite) {
                // Remove from favorites
                return prevFavorites.filter(fav => fav.domain !== domainItem.domain);
            } else {
                // Add to favorites
                // Ensure we don't add duplicates if somehow called rapidly (though UI should prevent this)
                if (!prevFavorites.some(fav => fav.domain === domainItem.domain)) {
                    return [...prevFavorites, domainItem];
                }
                return prevFavorites;
            }
        });
    }, []); // No dependencies needed for setFavorites with updater function

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