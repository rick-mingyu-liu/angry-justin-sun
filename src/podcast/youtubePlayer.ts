/**
 * YouTubePlayer: the official IFrame Player API. The player iframe uses the
 * privacy-enhanced youtube-nocookie.com host; the API script itself only
 * exists on www.youtube.com, so loading it may carry youtube.com cookies.
 * Neither is requested until the visitor ends up on YouTube. Unlike the Bilibili embed it can seek without
 * reloading and report the playback time, so the panel can follow chapters.
 */

const API_URL = "https://www.youtube.com/iframe_api";
const API_TIMEOUT_MS = 10_000;
const PLAYER_STATE_PLAYING = 1;

interface YTPlayer {
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  playVideo(): void;
  pauseVideo(): void;
  getCurrentTime(): number;
  getPlayerState(): number;
  destroy(): void;
}

interface YTPlayerOptions {
  host?: string;
  videoId: string;
  width?: string;
  height?: string;
  playerVars?: Record<string, string | number>;
  events?: {
    onReady?: () => void;
    onStateChange?: (event: { data: number }) => void;
    onError?: (event: { data: number }) => void;
  };
}

interface YTNamespace {
  Player: new (element: HTMLElement, options: YTPlayerOptions) => YTPlayer;
}

declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let apiPromise: Promise<YTNamespace> | null = null;

/** Loads the API script once. Rejects on a network error or after a timeout, and can be retried. */
function loadApi(): Promise<YTNamespace> {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  apiPromise ??= new Promise<YTNamespace>((resolve, reject) => {
    const timer = window.setTimeout(() => fail(new Error("YouTube API timed out")), API_TIMEOUT_MS);
    const script = document.createElement("script");
    const previous = window.onYouTubeIframeAPIReady;
    function fail(error: Error): void {
      window.clearTimeout(timer);
      script.remove();
      apiPromise = null;
      reject(error);
    }
    window.onYouTubeIframeAPIReady = () => {
      window.clearTimeout(timer);
      previous?.();
      if (window.YT?.Player) resolve(window.YT);
      else fail(new Error("YouTube API loaded without a Player"));
    };
    script.src = API_URL;
    script.async = true;
    script.onerror = () => fail(new Error("YouTube API failed to load"));
    document.head.append(script);
  });
  return apiPromise;
}

export interface YouTubePlayerOptions {
  videoId: string;
  startSeconds: number;
  title: string;
  /** Playback position in seconds while playing, about once a second. */
  onTime(seconds: number): void;
  /** The API or the video could not be loaded. */
  onFailure(error: Error): void;
}

export class YouTubePlayer {
  private player: YTPlayer | null = null;
  private ready = false;
  private destroyed = false;
  private pendingSeek: { seconds: number; play: boolean } | null = null;
  private timer: number | null = null;

  constructor(
    private readonly container: HTMLElement,
    private readonly options: YouTubePlayerOptions
  ) {
    const target = document.createElement("div");
    container.replaceChildren(target);
    loadApi().then(
      (YT) => {
        if (this.destroyed) return;
        this.player = new YT.Player(target, {
          host: "https://www.youtube-nocookie.com",
          videoId: options.videoId,
          width: "100%",
          height: "100%",
          playerVars: {
            start: Math.max(0, Math.floor(options.startSeconds)),
            autoplay: 0,
            rel: 0,
            playsinline: 1,
            origin: window.location.origin,
          },
          events: {
            onReady: () => this.handleReady(),
            onStateChange: (event) => this.handleState(event.data),
            onError: (event) => this.handleError(event.data),
          },
        });
      },
      (error: Error) => {
        if (!this.destroyed) options.onFailure(error);
      }
    );
  }

  /** Jumps to `seconds`; `play` starts playback (the click is the user gesture). */
  seek(seconds: number, play: boolean): void {
    const target = Math.max(0, Math.floor(seconds));
    if (!this.player || !this.ready) {
      this.pendingSeek = { seconds: target, play };
      return;
    }
    this.player.seekTo(target, true);
    if (play) this.player.playVideo();
  }

  /** Current position, or null before the player is ready. */
  currentTime(): number | null {
    if (!this.player || !this.ready) return null;
    const time = this.player.getCurrentTime();
    return Number.isFinite(time) ? time : null;
  }

  destroy(): void {
    this.destroyed = true;
    this.stopTimer();
    try {
      this.player?.destroy();
    } catch {
      // Already torn down by the API.
    }
    this.player = null;
    this.container.replaceChildren();
  }

  private handleReady(): void {
    if (this.destroyed || !this.player) return;
    this.ready = true;
    // The API replaces the target div with its iframe; give it an accessible name.
    this.container.querySelector("iframe")?.setAttribute("title", this.options.title);
    const pending = this.pendingSeek;
    this.pendingSeek = null;
    if (pending) this.seek(pending.seconds, pending.play);
  }

  private handleError(code: number): void {
    if (this.destroyed) return;
    this.options.onFailure(new Error(`YouTube player error ${code}`));
  }

  private handleState(state: number): void {
    // Events can still arrive while the API tears the player down.
    if (this.destroyed) return;
    if (state === PLAYER_STATE_PLAYING) this.startTimer();
    else this.stopTimer();
    this.report();
  }

  private startTimer(): void {
    if (this.timer !== null) return;
    this.timer = window.setInterval(() => this.report(), 1000);
  }

  private stopTimer(): void {
    if (this.timer === null) return;
    window.clearInterval(this.timer);
    this.timer = null;
  }

  private report(): void {
    const time = this.currentTime();
    if (time !== null) this.options.onTime(time);
  }

  setTitle(title: string): void {
    this.container.querySelector("iframe")?.setAttribute("title", title);
  }
}
