/**
 * ============================================================================
 * MUSIC PLAYER: LADY GAGA — "JUST DANCE" (GRABACIÓN ORIGINAL OFICIAL)
 * ============================================================================
 * Integración legítima y autorizada mediante la YouTube IFrame API oficial
 * de Lady Gaga / Vevo (Video ID: 2Abk1jAONjw) con enlaces oficiales a
 * Spotify, Apple Music y YouTube Music.
 * ============================================================================
 */

export class MusicPlayer {
  constructor() {
    this.player = null
    this.isReady = false
    this.isPlaying = false
    this.isExpanded = false
    this.currentVolume = 75
    this.ytVideoId = '2Abk1jAONjw' // Lady Gaga - Just Dance ft. Colby O'Donis (Official)

    this.container = null
    this.playBtn = null
    this.volumeSlider = null
    this.vinyl = null
    this.statusText = null
  }

  init() {
    this._createDOM()
    this._loadYouTubeAPI()
  }

  _createDOM() {
    const dock = document.createElement('div')
    dock.id = 'music-dock'
    dock.className = 'music-dock'
    dock.innerHTML = `
      <div class="music-dock-pill" id="music-dock-toggle" title="Reproductor de música oficial">
        <div class="music-vinyl" id="music-vinyl">
          <div class="vinyl-grooves"></div>
          <div class="vinyl-center">🎶</div>
        </div>
        <div class="music-dock-info">
          <span class="music-dock-title">Just Dance</span>
          <span class="music-dock-artist">Lady Gaga · Oficial</span>
        </div>
        <button class="music-dock-play" id="music-dock-play-btn" aria-label="Reproducir música">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
            <path id="play-icon-path" d="M8 5v14l11-7z"/>
          </svg>
        </button>
      </div>

      <!-- PANEL EXPANDIBLE -->
      <div class="music-panel" id="music-panel">
        <div class="music-panel-header">
          <span class="music-badge">✨ GRABACIÓN ORIGINAL</span>
          <button class="music-panel-close" id="music-panel-close-btn" aria-label="Cerrar panel">✕</button>
        </div>

        <div class="music-track-meta">
          <div class="music-album-art">
            <img src="https://i.ytimg.com/vi/2Abk1jAONjw/hqdefault.jpg" alt="Lady Gaga - Just Dance" />
            <div class="music-eq-bars" id="music-eq-bars">
              <span></span><span></span><span></span><span></span>
            </div>
          </div>
          <div class="music-meta-details">
            <div class="music-track-name">Just Dance</div>
            <div class="music-artist-name">Lady Gaga ft. Colby O'Donis</div>
            <div class="music-source-label" id="music-status-text">Listo para reproducir</div>
          </div>
        </div>

        <!-- CONTROLES -->
        <div class="music-controls-row">
          <button class="music-big-play" id="music-big-play-btn">
            <span id="music-play-text">▶ Reproducir Grabación Original</span>
          </button>
        </div>

        <div class="music-volume-row">
          <span class="volume-icon">🔊</span>
          <input type="range" min="0" max="100" value="75" id="music-volume" aria-label="Volumen" />
          <span class="volume-val" id="volume-val">75%</span>
        </div>

        <!-- CONTENEDOR DE LA INTEGRACIÓN OFICIAL -->
        <div class="music-embed-wrapper">
          <div id="yt-player-container"></div>
        </div>

        <!-- ENLACES OFICIALES -->
        <div class="music-official-links">
          <span class="links-title">Fuentes oficiales autorizadas:</span>
          <div class="links-chips">
            <a href="https://open.spotify.com/track/1ZHYJ2WwgCES45GjKACZWF" target="_blank" rel="noopener noreferrer" class="music-link-chip spotify">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>
              Spotify
            </a>
            <a href="https://www.youtube.com/watch?v=2Abk1jAONjw" target="_blank" rel="noopener noreferrer" class="music-link-chip youtube">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              YouTube
            </a>
            <a href="https://music.apple.com/us/album/just-dance-feat-colby-odonis/1440818588?i=1440818671" target="_blank" rel="noopener noreferrer" class="music-link-chip apple">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.38c.62-.75 1.04-1.8 0.93-2.85-.9.04-1.99.6-2.63 1.35-.57.65-1.07 1.72-.94 2.74 1 .08 2.02-.49 2.64-1.24z"/></svg>
              Apple Music
            </a>
          </div>
        </div>
      </div>
    `
    document.body.appendChild(dock)

    this.container = dock
    this.vinyl = dock.querySelector('#music-vinyl')
    this.statusText = dock.querySelector('#music-status-text')
    this.volumeSlider = dock.querySelector('#music-volume')

    // Bind event listeners
    const toggleBtn = dock.querySelector('#music-dock-toggle')
    const closeBtn = dock.querySelector('#music-panel-close-btn')
    const dockPlayBtn = dock.querySelector('#music-dock-play-btn')
    const bigPlayBtn = dock.querySelector('#music-big-play-btn')

    toggleBtn.addEventListener('click', (e) => {
      // If clicking directly on play button, only toggle playback
      if (e.target.closest('#music-dock-play-btn')) {
        this.togglePlay()
        return
      }
      this.togglePanel()
    })

    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation()
      this.closePanel()
    })

    dockPlayBtn.addEventListener('click', (e) => {
      e.stopPropagation()
      this.togglePlay()
    })

    bigPlayBtn.addEventListener('click', (e) => {
      e.stopPropagation()
      this.togglePlay()
    })

    this.volumeSlider.addEventListener('input', (e) => {
      this.setVolume(Number(e.target.value))
    })
  }

  _loadYouTubeAPI() {
    if (window.YT && window.YT.Player) {
      this._initYTPlayer()
      return
    }

    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    const firstScriptTag = document.getElementsByTagName('script')[0]
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)

    window.onYouTubeIframeAPIReady = () => {
      this._initYTPlayer()
    }
  }

  _initYTPlayer() {
    try {
      this.player = new window.YT.Player('yt-player-container', {
        height: '100',
        width: '100%',
        videoId: this.ytVideoId,
        playerVars: {
          autoplay: 0,
          controls: 1,
          modestbranding: 1,
          rel: 0,
          enablejsapi: 1,
          playsinline: 1
        },
        events: {
          onReady: () => {
            this.isReady = true
            this.player.setVolume(this.currentVolume)
            if (this.statusText) this.statusText.textContent = 'Grabación lista · Toca Play'
          },
          onStateChange: (event) => {
            // YT.PlayerState.PLAYING = 1, PAUSED = 2, ENDED = 0
            if (event.data === 1) {
              this._setPlayingState(true)
            } else if (event.data === 2 || event.data === 0) {
              this._setPlayingState(false)
            }
          },
          onError: (err) => {
            console.warn('[MusicPlayer] IFrame fallback triggered:', err)
            if (this.statusText) {
              this.statusText.textContent = 'Abre en Spotify o YouTube oficial abajo'
            }
          }
        }
      })
    } catch (e) {
      console.warn('[MusicPlayer] Init failed:', e)
    }
  }

  togglePlay() {
    if (!this.player || !this.isReady) {
      // If player is not fully loaded yet, open panel to let user engage
      this.openPanel()
      return
    }

    if (this.isPlaying) {
      this.pause()
    } else {
      this.play()
    }
  }

  play() {
    if (this.player && this.isReady && typeof this.player.playVideo === 'function') {
      try {
        this.player.playVideo()
        this._setPlayingState(true)
      } catch (e) {
        console.warn('[MusicPlayer] Play blocked:', e)
      }
    } else {
      this.openPanel()
    }
  }

  pause() {
    if (this.player && typeof this.player.pauseVideo === 'function') {
      try {
        this.player.pauseVideo()
        this._setPlayingState(false)
      } catch (e) {
        console.warn('[MusicPlayer] Pause failed:', e)
      }
    }
  }

  setVolume(val) {
    this.currentVolume = Math.max(0, Math.min(100, val))
    if (this.player && typeof this.player.setVolume === 'function') {
      this.player.setVolume(this.currentVolume)
    }
    const valLabel = document.getElementById('volume-val')
    if (valLabel) valLabel.textContent = `${this.currentVolume}%`
  }

  _setPlayingState(playing) {
    this.isPlaying = playing
    const playIconPath = document.getElementById('play-icon-path')
    const bigPlayText = document.getElementById('music-play-text')
    const eqBars = document.getElementById('music-eq-bars')

    if (playing) {
      this.container.classList.add('playing')
      if (this.vinyl) this.vinyl.classList.add('spinning')
      if (playIconPath) playIconPath.setAttribute('d', 'M6 19h4V5H6v14zm8-14v14h4V5h-4z')
      if (bigPlayText) bigPlayText.textContent = '⏸ Pausar Música'
      if (this.statusText) this.statusText.textContent = '🎶 Sonando: Lady Gaga — Just Dance'
      if (eqBars) eqBars.classList.add('active')
    } else {
      this.container.classList.remove('playing')
      if (this.vinyl) this.vinyl.classList.remove('spinning')
      if (playIconPath) playIconPath.setAttribute('d', 'M8 5v14l11-7z')
      if (bigPlayText) bigPlayText.textContent = '▶ Reproducir Grabación Original'
      if (this.statusText) this.statusText.textContent = 'Pausado'
      if (eqBars) eqBars.classList.remove('active')
    }
  }

  togglePanel() {
    if (this.isExpanded) {
      this.closePanel()
    } else {
      this.openPanel()
    }
  }

  openPanel() {
    this.isExpanded = true
    const panel = document.getElementById('music-panel')
    if (panel) panel.classList.add('open')
  }

  closePanel() {
    this.isExpanded = false
    const panel = document.getElementById('music-panel')
    if (panel) panel.classList.remove('open')
  }
}
