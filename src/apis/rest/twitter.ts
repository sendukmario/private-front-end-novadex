const API_BASE_URL =
  process.env.NEXT_PUBLIC_TWITTER_FETCHER_URL || "https://media.nova.trade/api";

// export interface TwitterUserData {
//   success: boolean;
//   usernames: { username: string; time: number }[];
// }

// export interface TwitterScoredFollowersData {
//   notable_followers: {
//     follower_num_followers: number;
//     follower_username: string;
//     profile_picture: string;
//   }[];
// }
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

// export const fetchTwitterUser = async (
//   username: string,
// ): Promise<TwitterUserData> => {
//   const response = await fetch(
//     `${API_BASE_URL}/fetch-past-usernames?username=${username}`,
//     {
//       method: "GET",
//       headers: { "Content-Type": "application/json" },
//     },
//   );

//   if (!response.ok) throw new Error("Failed to fetch Twitter data");
//   return response.json();
// };

// export const fetchTwitterUserStatus = async (
//   statusURL: string,
// ): Promise<TwitterUserStatusData> => {
//   const response = await fetch(`${API_BASE_URL}/fetch-tweet?url=${statusURL}`, {
//     method: "GET",
//     headers: { "Content-Type": "application/json" },
//   });

//   if (!response.ok) throw new Error("Failed to fetch Twitter Status data");
//   return response.json();
// };

// export const fetchScoredFollowers = async (
//   username: string,
// ): Promise<TwitterScoredFollowersData> => {
//   const response = await fetch(
//     `${API_BASE_URL}/fetch-scored-followers?username=${username}`,
//     {
//       method: "GET",
//       headers: { "Content-Type": "application/json" },
//     },
//   );

//   if (!response.ok) throw new Error("Failed to fetch Twitter data");
//   return response.json();
// };

// export const fetchFollowing = async (username: string): Promise<number> => {
//   const response = await fetch(
//     `${API_BASE_URL}/fetch-following?username=${username}`,
//     {
//       method: "GET",
//       headers: { "Content-Type": "application/json" },
//     },
//   );

//   if (!response.ok) throw new Error("Failed to fetch Twitter data");
//   return response.json();
// };

// export const fetchFollowers = async (username: string): Promise<number> => {
//   const response = await fetch(
//     `${API_BASE_URL}/fetch-followers?username=${username}`,
//     {
//       method: "GET",
//       headers: { "Content-Type": "application/json" },
//     },
//   );

//   if (!response.ok) throw new Error("Failed to fetch Twitter data");
//   return response.json();
// };

// -----------------------------------------------------------

export interface TwitterUserData {
  success: boolean;
  past: {
    username: string;
    timestamp: number;
  }[];
  new: NewTwitterUserData;
}

export interface PastTwitterUserData {
  username: string;
  timestamp: number;
}

export interface NewTwitterUserData {
  image_profile: string;
  username: string;
  following: number;
  follower: number;
  followed_by: {
    username: string;
    image_profile: string;
  }[];
  is_blue_verified: boolean;
  timestamp: number;
}

export const fetchTwitterUserData = async (
  username: string,
): Promise<TwitterUserData> => {
  const response = await fetch(`${API_BASE_URL}/fetch-x?username=${username}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) throw new Error("Failed to fetch X user data");
  return response.json();
};
