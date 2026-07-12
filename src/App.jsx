import Header from './components/Header'
import EmptyState from './components/EmptyState'
import Dropzone from './components/Dropzone'
import ImageThumbnailList from './components/ImageThumbnailList'
import PageSettings from './components/PageSettings'
import ConvertButton from './components/ConvertButton'
import DownloadPanel from './components/DownloadPanel'
import { useApp } from './context/AppContext'

export default function App() {
  const { images } = useApp()
  const hasImages = images.length > 0

  return (
    <div className="min-h-full flex flex-col bg-white">
      <Header />

      <main className="flex-1 w-full max-w-5xl mx-auto px-6 py-10 flex flex-col items-center gap-8">
        {!hasImages && <EmptyState />}

        <Dropzone />

        {hasImages && (
          <>
            <ImageThumbnailList />
            <PageSettings />
            <div className="w-full max-w-md">
              <ConvertButton />
            </div>
            <DownloadPanel />
          </>
        )}
      </main>

      <footer className="w-full border-t border-slate-200/60 bg-slate-50/50">
        <div className="max-w-5xl mx-auto px-6 py-4 text-center text-xs text-slate-400">
          All processing happens in your browser. No images are uploaded anywhere.
        </div>
      </footer>
    </div>
  )
}
