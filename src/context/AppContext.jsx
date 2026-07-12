import { createContext, useCallback, useContext, useMemo, useReducer, useRef } from 'react'
import { MAX_FILES } from '../lib/fileValidation'

const AppContext = createContext(null)

// --- Reducer ---------------------------------------------------------------

const initialState = {
  images: [], // { id, file, name, thumbnailUrl, isHeic, width, height }
  settings: {
    pageSize: 'A4', // 'A4' | 'Letter'
    orientation: 'portrait', // 'portrait' | 'landscape'
  },
  status: 'idle', // 'idle' | 'converting' | 'ready' | 'error'
  pdfBlob: null,
  pdfUrl: null,
  error: null,
  progress: { current: 0, total: 0 },
}

function reducer(state, action) {
  switch (action.type) {
    case 'ADD_IMAGES': {
      const incoming = action.images
      const merged = [...state.images, ...incoming].slice(0, MAX_FILES)
      // Adding new images invalidates any previously generated PDF.
      if (state.pdfBlob) URL.revokeObjectURL(state.pdfBlob)
      return {
        ...state,
        images: merged,
        status: 'idle',
        pdfBlob: null,
        pdfUrl: null,
        error: null,
      }
    }
    case 'REMOVE_IMAGE': {
      const next = state.images.filter((img) => img.id !== action.id)
      const removed = state.images.find((img) => img.id === action.id)
      if (removed?.thumbnailUrl) URL.revokeObjectURL(removed.thumbnailUrl)
      return {
        ...state,
        images: next,
        status: 'idle',
        pdfBlob: null,
        pdfUrl: null,
      }
    }
    case 'REORDER_IMAGES': {
      return { ...state, images: action.images }
    }
    case 'CLEAR_IMAGES': {
      state.images.forEach((img) => {
        if (img.thumbnailUrl) URL.revokeObjectURL(img.thumbnailUrl)
      })
      if (state.pdfBlob) URL.revokeObjectURL(state.pdfBlob)
      return {
        ...initialState,
      }
    }
    case 'UPDATE_SETTINGS': {
      return {
        ...state,
        settings: { ...state.settings, ...action.patch },
        status: 'idle',
        pdfBlob: null,
        pdfUrl: null,
      }
    }
    case 'CONVERSION_START': {
      return {
        ...state,
        status: 'converting',
        error: null,
        progress: { current: 0, total: action.total },
      }
    }
    case 'CONVERSION_PROGRESS': {
      return {
        ...state,
        progress: { current: action.current, total: action.total },
      }
    }
    case 'CONVERSION_SUCCESS': {
      return {
        ...state,
        status: 'ready',
        pdfBlob: action.blob,
        pdfUrl: URL.createObjectURL(action.blob),
        progress: { current: action.total, total: action.total },
      }
    }
    case 'CONVERSION_ERROR': {
      return {
        ...state,
        status: 'error',
        error: action.error,
      }
    }
    case 'RESET_RESULT': {
      if (state.pdfBlob) URL.revokeObjectURL(state.pdfBlob)
      return {
        ...state,
        status: 'idle',
        pdfBlob: null,
        pdfUrl: null,
        error: null,
      }
    }
    default:
      return state
  }
}

// --- Provider --------------------------------------------------------------

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  // Keep the latest state on a ref so async callbacks (e.g. from the
  // ConvertButton) always see fresh values without re-creating dispatchers.
  const stateRef = useRef(state)
  stateRef.current = state

  const addImages = useCallback((images) => dispatch({ type: 'ADD_IMAGES', images }), [])
  const removeImage = useCallback((id) => dispatch({ type: 'REMOVE_IMAGE', id }), [])
  const reorderImages = useCallback((images) => dispatch({ type: 'REORDER_IMAGES', images }), [])
  const clearImages = useCallback(() => dispatch({ type: 'CLEAR_IMAGES' }), [])
  const updateSettings = useCallback(
    (patch) => dispatch({ type: 'UPDATE_SETTINGS', patch }),
    [],
  )
  const startConversion = useCallback(
    (total) => dispatch({ type: 'CONVERSION_START', total }),
    [],
  )
  const reportProgress = useCallback(
    (current, total) => dispatch({ type: 'CONVERSION_PROGRESS', current, total }),
    [],
  )
  const succeedConversion = useCallback(
    (blob) => dispatch({ type: 'CONVERSION_SUCCESS', blob, total: stateRef.current.images.length }),
    [],
  )
  const failConversion = useCallback(
    (error) => dispatch({ type: 'CONVERSION_ERROR', error }),
    [],
  )
  const resetResult = useCallback(() => dispatch({ type: 'RESET_RESULT' }), [])

  const value = useMemo(
    () => ({
      ...state,
      addImages,
      removeImage,
      reorderImages,
      clearImages,
      updateSettings,
      startConversion,
      reportProgress,
      succeedConversion,
      failConversion,
      resetResult,
      stateRef,
    }),
    [
      state,
      addImages,
      removeImage,
      reorderImages,
      clearImages,
      updateSettings,
      startConversion,
      reportProgress,
      succeedConversion,
      failConversion,
      resetResult,
    ],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>')
  return ctx
}
