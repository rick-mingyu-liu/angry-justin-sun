export type VideoRef = { bvid: string; page?: number; startSeconds?: number };
export type Chapter = { id: string; title: string; startSeconds: number };
export type Podcast = {
  id: string;
  title: string;
  video: VideoRef;
  chapters: Chapter[];
};
