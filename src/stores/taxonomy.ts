import { defineStore } from 'pinia'
import { tagList, genreList } from '../api/Taxonomy/NovelTaxonomyController'

export interface Tag {
  tagId: number
  slug: string
  names: {
    en: string
    zh?: string
    ja?: string
  }
  color?: string
  description?: string
}

export interface Genre {
  genreId: number
  slug: string
  names: {
    en: string
    zh?: string
    ja?: string
  }
  color?: string
  description?: string
}

export interface TagOption {
  label: string
  value: number
}

export interface GenreOption {
  label: string
  value: number
}

export const useTaxonomyStore = defineStore('taxonomy', {
  state: () => ({
    // Tags
    tags: [] as Tag[],
    tagOptions: [] as TagOption[],
    tagsLoading: false,
    tagsLastUpdated: 0,
    
    // Genres
    genres: [] as Genre[],
    genreOptions: [] as GenreOption[],
    genresLoading: false,
    genresLastUpdated: 0,
    
    // Cache settings
    cacheExpiry: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  }),

  getters: {
    // Check if tags cache is valid
    isTagsCacheValid: (state) => {
      return state.tags.length > 0 && 
             (Date.now() - state.tagsLastUpdated) < state.cacheExpiry
    },

    // Check if genres cache is valid
    isGenresCacheValid: (state) => {
      return state.genres.length > 0 && 
             (Date.now() - state.genresLastUpdated) < state.cacheExpiry
    },

    // Get tag by ID
    getTagById: (state) => (tagId: number) => {
      return state.tags.find(tag => tag.tagId === tagId)
    },

    // Get genre by ID
    getGenreById: (state) => (genreId: number) => {
      return state.genres.find(genre => genre.genreId === genreId)
    },

    // Get tag name by ID
    getTagName: (state) => (tagId: number) => {
      const tag = state.tags.find(tag => tag.tagId === tagId)
      return tag ? (tag.names?.en || tag.slug) : `Tag ${tagId}`
    },

    // Get genre name by ID
    getGenreName: (state) => (genreId: number) => {
      const genre = state.genres.find(genre => genre.genreId === genreId)
      return genre ? (genre.names?.en || genre.slug) : `Genre ${genreId}`
    },

    // Get tag names for array of IDs
    getTagNames: (state) => (tagIds: number[]) => {
      return tagIds.map(id => {
        const tag = state.tags.find(tag => tag.tagId === id)
        return tag ? (tag.names?.en || tag.slug) : `Tag ${id}`
      })
    },

    // Get genre names for array of IDs
    getGenreNames: (state) => (genreIds: number[]) => {
      return genreIds.map(id => {
        const genre = state.genres.find(genre => genre.genreId === id)
        return genre ? (genre.names?.en || genre.slug) : `Genre ${id}`
      })
    },
  },

  actions: {
    // Load all tags with pagination
    async loadTags() {
      if (this.isTagsCacheValid) {
        console.log('🏷️ Using cached tags:', this.tags.length)
        return this.tags
      }

      try {
        this.tagsLoading = true
        console.log('🔄 Loading tags from API...')
        
        const allTags: Tag[] = []
        let page = 1
        let hasMore = true
        
        while (hasMore) {
          const tagRes = await tagList(page, 100) // Load 100 per page
          console.log(`📊 Tag API response page ${page}:`, tagRes)
          
          if (tagRes?.success && tagRes.result?.items) {
            allTags.push(...tagRes.result.items)
            hasMore = tagRes.result.items.length === 100 && page < 50 // Safety limit
            page++
            
            // Update loading progress
            if (page % 5 === 0) {
              console.log(`🏷️ Loaded ${allTags.length} tags so far...`)
            }
          } else {
            hasMore = false
          }
        }
        
        console.log('🏷️ Total tags loaded:', allTags.length)
        
        // Update state
        this.tags = allTags
        this.tagOptions = allTags.map(tag => ({
          label: tag.names?.en || tag.slug || `Tag ${tag.tagId}`,
          value: tag.tagId
        }))
        this.tagsLastUpdated = Date.now()
        
        // Save to localStorage
        this.saveTagsToStorage()
        
        return allTags
      } catch (error) {
        console.error('❌ Failed to load tags:', error)
        throw error
      } finally {
        this.tagsLoading = false
      }
    },

    // Load all genres with pagination
    async loadGenres() {
      if (this.isGenresCacheValid) {
        console.log('🎭 Using cached genres:', this.genres.length)
        return this.genres
      }

      try {
        this.genresLoading = true
        console.log('🔄 Loading genres from API...')
        
        const allGenres: Genre[] = []
        let page = 1
        let hasMore = true
        
        while (hasMore) {
          const genreRes = await genreList(page, 100) // Load 100 per page
          console.log(`📊 Genre API response page ${page}:`, genreRes)
          
          if (genreRes?.success && genreRes.result?.items) {
            allGenres.push(...genreRes.result.items)
            hasMore = genreRes.result.items.length === 100 && page < 50 // Safety limit
            page++
            
            // Update loading progress
            if (page % 5 === 0) {
              console.log(`🎭 Loaded ${allGenres.length} genres so far...`)
            }
          } else {
            hasMore = false
          }
        }
        
        console.log('🎭 Total genres loaded:', allGenres.length)
        
        // Update state
        this.genres = allGenres
        this.genreOptions = allGenres.map(genre => ({
          label: genre.names?.en || genre.slug || `Genre ${genre.genreId}`,
          value: genre.genreId
        }))
        this.genresLastUpdated = Date.now()
        
        // Save to localStorage
        this.saveGenresToStorage()
        
        return allGenres
      } catch (error) {
        console.error('❌ Failed to load genres:', error)
        throw error
      } finally {
        this.genresLoading = false
      }
    },

    // Load both tags and genres
    async loadAll() {
      try {
        await Promise.all([
          this.loadTags(),
          this.loadGenres()
        ])
        console.log('✅ All taxonomy data loaded successfully')
      } catch (error) {
        console.error('❌ Failed to load taxonomy data:', error)
        throw error
      }
    },

    // Save tags to localStorage
    saveTagsToStorage() {
      try {
        const data = {
          tags: this.tags,
          tagOptions: this.tagOptions,
          lastUpdated: this.tagsLastUpdated
        }
        localStorage.setItem('kira-taxonomy-tags', JSON.stringify(data))
        console.log('💾 Tags saved to localStorage')
      } catch (error) {
        console.warn('⚠️ Failed to save tags to localStorage:', error)
      }
    },

    // Save genres to localStorage
    saveGenresToStorage() {
      try {
        const data = {
          genres: this.genres,
          genreOptions: this.genreOptions,
          lastUpdated: this.genresLastUpdated
        }
        localStorage.setItem('kira-taxonomy-genres', JSON.stringify(data))
        console.log('💾 Genres saved to localStorage')
      } catch (error) {
        console.warn('⚠️ Failed to save genres to localStorage:', error)
      }
    },

    // Load tags from localStorage
    loadTagsFromStorage() {
      try {
        const data = localStorage.getItem('kira-taxonomy-tags')
        if (data) {
          const parsed = JSON.parse(data)
          const now = Date.now()
          
          // Check if cache is still valid
          if (parsed.lastUpdated && (now - parsed.lastUpdated) < this.cacheExpiry) {
            this.tags = parsed.tags || []
            this.tagOptions = parsed.tagOptions || []
            this.tagsLastUpdated = parsed.lastUpdated
            console.log('💾 Tags loaded from localStorage:', this.tags.length)
            return true
          } else {
            console.log('⏰ Tags cache expired, will reload from API')
            return false
          }
        }
        return false
      } catch (error) {
        console.warn('⚠️ Failed to load tags from localStorage:', error)
        return false
      }
    },

    // Load genres from localStorage
    loadGenresFromStorage() {
      try {
        const data = localStorage.getItem('kira-taxonomy-genres')
        if (data) {
          const parsed = JSON.parse(data)
          const now = Date.now()
          
          // Check if cache is still valid
          if (parsed.lastUpdated && (now - parsed.lastUpdated) < this.cacheExpiry) {
            this.genres = parsed.genres || []
            this.genreOptions = parsed.genreOptions || []
            this.genresLastUpdated = parsed.lastUpdated
            console.log('💾 Genres loaded from localStorage:', this.genres.length)
            return true
          } else {
            console.log('⏰ Genres cache expired, will reload from API')
            return false
          }
        }
        return false
      } catch (error) {
        console.warn('⚠️ Failed to load genres from localStorage:', error)
        return false
      }
    },

    // Initialize store from localStorage
    initFromStorage() {
      console.log('🔄 Initializing taxonomy store from localStorage...')
      const tagsLoaded = this.loadTagsFromStorage()
      const genresLoaded = this.loadGenresFromStorage()
      
      if (tagsLoaded && genresLoaded) {
        console.log('✅ Taxonomy store initialized from localStorage')
      } else {
        console.log('🔄 Some data not in localStorage, will load from API')
      }
    },

    // Clear cache and localStorage
    clearCache() {
      this.tags = []
      this.tagOptions = []
      this.tagsLastUpdated = 0
      this.genres = []
      this.genreOptions = []
      this.genresLastUpdated = 0
      
      try {
        localStorage.removeItem('kira-taxonomy-tags')
        localStorage.removeItem('kira-taxonomy-genres')
        console.log('🗑️ Taxonomy cache cleared')
      } catch (error) {
        console.warn('⚠️ Failed to clear localStorage:', error)
      }
    },
  },
}) 