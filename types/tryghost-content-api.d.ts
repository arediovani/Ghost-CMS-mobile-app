declare module '@tryghost/content-api' {
  interface GhostContentAPIOptions {
    url: string;
    key: string;
    version: string;
    host?: string;
    ghostPath?: string;
  }

  interface BrowseOptions {
    limit?: number;
    page?: number;
    include?: string;
    filter?: string;
    order?: string;
    [key: string]: unknown;
  }

  interface ReadOptions {
    include?: string;
    formats?: string[];
    [key: string]: unknown;
  }

  interface PostsAPI {
    browse(options?: BrowseOptions): Promise<unknown>;
    read(
      identity: { id?: string; slug?: string },
      options?: ReadOptions
    ): Promise<unknown>;
  }

  interface ContentAPI {
    posts: PostsAPI;
  }

  interface GhostContentAPIConstructor {
    new (options: GhostContentAPIOptions): ContentAPI;
    (options: GhostContentAPIOptions): ContentAPI;
  }
  const GhostContentAPI: GhostContentAPIConstructor;
  export default GhostContentAPI;
}
