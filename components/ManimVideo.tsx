import React, { useState, useEffect } from 'react';
import { ManimVideoState } from '../types';

interface Props {
  state: ManimVideoState;
}

const ManimVideo: React.FC<Props> = ({ state }) => {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVideo = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('http://localhost:8000/api/render', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ animation_id: state.animationId }),
        });

        if (!response.ok) {
          throw new Error(`Failed to render: ${response.statusText}`);
        }

        const data = await response.json();
        setVideoUrl(`http://localhost:8000${data.video_url}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load video');
      } finally {
        setLoading(false);
      }
    };

    fetchVideo();
  }, [state.animationId]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-stone-50 rounded-3xl shadow-inner p-8 transition-all duration-500">
      {loading && (
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-lg text-stone-600 font-semibold">Rendering animation...</p>
        </div>
      )}

      {error && (
        <div className="text-center">
          <p className="text-red-600 font-bold mb-2">Error loading animation</p>
          <p className="text-sm text-stone-500">{error}</p>
        </div>
      )}

      {videoUrl && !loading && (
        <div className="w-full max-w-3xl flex flex-col items-center gap-6">
          <video
            src={videoUrl}
            controls
            autoPlay
            loop
            className="w-full rounded-2xl shadow-2xl bg-black"
          />
          {state.annotation && (
            <div className="text-xl text-sky-700 font-sans font-bold uppercase tracking-widest">
              {state.annotation}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ManimVideo;
