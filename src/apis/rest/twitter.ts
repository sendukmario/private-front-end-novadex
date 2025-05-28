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

// -----------------------------------------------------------

export interface TwitterUserData {
  success: boolean;
  past: {
    username: string;
    timestamp: number;
  }[];
  new: NewTwitterUserData;
  loading?: {
    scoredFollowers?: boolean;
    followers?: boolean;
    following?: boolean;
    pastUsernames?: boolean;
    pfp?: boolean;
  };
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

export interface TwitterScoredFollowersData {
  notable_followers: {
    follower_num_followers: number;
    follower_username: string;
    profile_picture: string;
  }[];
}

export interface TwitterFollowersData {
  followers: number;
}

export interface TwitterFollowingData {
  following: number;
}

export interface TwitterPastUsernamesData {
  success: boolean;
  usernames: {
    username: string;
    time: number | string;
  }[];
}

export interface TwitterPfpData {
  image: string;
}

export const fetchScoredFollowers = async (
  username: string,
): Promise<TwitterScoredFollowersData> => {
  const response = await fetch(
    `${API_BASE_URL}/fetch-scored-followers?username=${username}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    },
  );

  if (!response.ok) throw new Error("Failed to fetch scored followers");
  return response.json();
};

export const fetchFollowers = async (
  username: string,
): Promise<TwitterFollowersData> => {
  const response = await fetch(
    `${API_BASE_URL}/fetch-followers?username=${username}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    },
  );

  if (!response.ok) throw new Error("Failed to fetch followers");
  return response.json();
};

export const fetchFollowing = async (
  username: string,
): Promise<TwitterFollowingData> => {
  const response = await fetch(
    `${API_BASE_URL}/fetch-following?username=${username}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    },
  );

  if (!response.ok) throw new Error("Failed to fetch following");
  return response.json();
};

export const fetchPastUsernames = async (
  username: string,
): Promise<TwitterPastUsernamesData> => {
  const response = await fetch(
    `${API_BASE_URL}/fetch-past-usernames?username=${username}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    },
  );

  if (!response.ok) throw new Error("Failed to fetch past usernames");
  return response.json();
};

export const fetchPfp = async (
  username: string,
): Promise<TwitterPfpData> => {
  const response = await fetch(
    `${API_BASE_URL}/fetch-pfp?username=${username}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    },
  );

  if (!response.ok) throw new Error("Failed to fetch profile picture");
  return response.json();
};

export const fetchTwitterUserData = async (
  username: string,
  onDataUpdate?: (data: Partial<TwitterUserData>) => void
): Promise<TwitterUserData> => {
  try {
    // Initialize base data structure
    const baseData: TwitterUserData = {
      success: true,
      past: [],
      new: {
        image_profile: '',
        username: username,
        following: 0,
        follower: 0,
        followed_by: [],
        is_blue_verified: false,
        timestamp: Date.now()
      },
      loading: {
        scoredFollowers: true,
        followers: true,
        following: true,
        pastUsernames: true,
        pfp: true
      }
    };

    // Notify initial state
    onDataUpdate?.(baseData);

    // Create individual fetch promises with update callbacks
    const fetchPromises = [
      fetchScoredFollowers(username).then(data => {
        // Only take first 3 followers
        baseData.new.followed_by = data.notable_followers.slice(0, 3).map(f => ({
          username: f.follower_username,
          image_profile: f.profile_picture
        }));
        baseData.loading!.scoredFollowers = false;
        onDataUpdate?.({ ...baseData });
        return data;
      }).catch(error => {
        console.error('Error fetching scored followers:', error);
        baseData.loading!.scoredFollowers = false;
        onDataUpdate?.({ ...baseData });
        return null;
      }),

      fetchFollowers(username).then(data => {
        // Handle both number and object responses
        baseData.new.follower = typeof data === 'number' ? data : data.followers;
        baseData.loading!.followers = false;
        onDataUpdate?.({ ...baseData });
        return data;
      }).catch(error => {
        console.error('Error fetching followers:', error);
        baseData.loading!.followers = false;
        onDataUpdate?.({ ...baseData });
        return null;
      }),

      fetchFollowing(username).then(data => {
        // Handle both number and object responses
        baseData.new.following = typeof data === 'number' ? data : data.following;
        baseData.loading!.following = false;
        onDataUpdate?.({ ...baseData });
        return data;
      }).catch(error => {
        console.error('Error fetching following:', error);
        baseData.loading!.following = false;
        onDataUpdate?.({ ...baseData });
        return null;
      }),

      fetchPastUsernames(username).then(data => {
        if (data.success && data.usernames) {
          baseData.past = data.usernames.map(u => ({
            username: u.username,
            timestamp: typeof u.time === 'string' ? parseInt(u.time) : u.time
          }));
        }
        baseData.loading!.pastUsernames = false;
        onDataUpdate?.({ ...baseData });
        return data;
      }).catch(error => {
        console.error('Error fetching past usernames:', error);
        baseData.loading!.pastUsernames = false;
        onDataUpdate?.({ ...baseData });
        return null;
      }),

      fetchPfp(username).then(data => {
        baseData.new.image_profile = data.image;
        baseData.loading!.pfp = false;
        onDataUpdate?.({ ...baseData });
        return data;
      }).catch(error => {
        console.error('Error fetching profile picture:', error);
        baseData.loading!.pfp = false;
        onDataUpdate?.({ ...baseData });
        return null;
      })
    ];

    // Wait for all requests to complete
    await Promise.all(fetchPromises);

    // Remove loading state from final response
    const { loading, ...finalData } = baseData;
    return finalData;
  } catch (error) {
    console.error('Error fetching Twitter data:', error);
    throw error;
  }
};
