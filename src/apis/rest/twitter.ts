const API_BASE_URL =
  process.env.NEXT_PUBLIC_TWITTER_FETCHER_URL || "https://media.nova.trade/api";

export interface TwitterUserData {
  success: boolean;
  usernames: { username: string; time: number }[];
}
export interface TwitterUserStatusData {
  data: {
    tweetResult: {
      result: {
        core: {
          user_results: {
            result: {
              is_blue_verified: boolean;
              legacy: {
                name: string;
                profile_image_url_https: string;
                screen_name: string;
                verified: boolean;
              };
            };
          };
        };
        legacy: {
          created_at: string;
          entities: {
            media: {
              media_url_https: string;
            }[];
          };
          full_text: string;
          favorite_count: number;
          reply_count: number;
          retweet_count: number;
        };
      };
    };
  };
}

export const fetchTwitterUser = async (
  username: string,
): Promise<TwitterUserData> => {
  const response = await fetch(
    `${API_BASE_URL}/fetch-past-usernames?username=${username}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    },
  );

  if (!response.ok) throw new Error("Failed to fetch Twitter data");
  return response.json();
};

export const fetchTwitterUserStatus = async (
  statusURL: string,
): Promise<TwitterUserStatusData> => {
  const response = await fetch(`${API_BASE_URL}/fetch-tweet?url=${statusURL}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) throw new Error("Failed to fetch Twitter Status data");
  return response.json();
};
