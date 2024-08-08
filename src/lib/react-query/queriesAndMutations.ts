import {
	useQuery,
	useMutation,
	useQueryClient,
	useInfiniteQuery,
} from '@tanstack/react-query';

import { QUERY_KEYS } from '@/lib/react-query/queryKeys';
import {
	createUserAccount,
	signInAccount,
	getCurrentUser,
	signOutAccount,
	getUsers,
	createPost,
	getPostById,
	updatePost,
	getUserPosts,
	deletePost,
	likePost,
	getUserById,
	updateUser,
	getRecentPosts,
	getInfinitePosts,
	searchPosts,
	savePost,
	deleteSavedPost,
	getFollowStats,
	followUser,
	unfollowUser,
	isFollowingUser,
} from '@/lib/appwrite/api';
import {
	IFollower,
	INewPost,
	INewUser,
	IUpdatePost,
	IUpdateUser,
} from '@/types';

// ============================================================
// AUTH QUERIES
// ============================================================

export const useCreateUserAccount = () => {
	return useMutation({
		mutationFn: (user: INewUser) => createUserAccount(user),
	});
};

export const useSignInAccount = () => {
	return useMutation({
		mutationFn: (user: { email: string; password: string }) =>
			signInAccount(user),
	});
};

export const useSignOutAccount = () => {
	return useMutation({
		mutationFn: signOutAccount,
	});
};

// ============================================================
// POST QUERIES
// ============================================================

export const useGetPosts = () => {
	return useInfiniteQuery({
		queryKey: [QUERY_KEYS.GET_INFINITE_POSTS],
		queryFn: getInfinitePosts,
		getNextPageParam: (lastPage) => {
			// If there's no data, there are no more pages.
			if (lastPage && lastPage.documents.length === 0) {
				return null;
			}

			// Use the $id of the last document as the cursor.
			const lastId = lastPage.documents[lastPage?.documents.length - 1].$id;
			return lastId;
		},
	});
};

export const useSearchPosts = (searchTerm: string) => {
	return useQuery({
		queryKey: [QUERY_KEYS.SEARCH_POSTS, searchTerm],
		queryFn: () => searchPosts(searchTerm),
		enabled: !!searchTerm,
	});
};

export const useGetRecentPosts = () => {
	return useQuery({
		queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
		queryFn: getRecentPosts,
	});
};

export const useCreatePost = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (post: INewPost) => createPost(post),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
			});
		},
	});
};

export const useGetPostById = (postId?: string) => {
	return useQuery({
		queryKey: [QUERY_KEYS.GET_POST_BY_ID, postId],
		queryFn: () => getPostById(postId),
		enabled: !!postId,
	});
};

export const useGetUserPosts = (userId?: string) => {
	return useQuery({
		queryKey: [QUERY_KEYS.GET_USER_POSTS, userId],
		queryFn: () => getUserPosts(userId),
		enabled: !!userId,
	});
};

export const useUpdatePost = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (post: IUpdatePost) => updatePost(post),
		onSuccess: (data) => {
			queryClient.invalidateQueries({
				queryKey: [QUERY_KEYS.GET_POST_BY_ID, data?.$id],
			});
		},
	});
};

export const useDeletePost = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ postId, imageId }: { postId?: string; imageId: string }) =>
			deletePost(postId, imageId),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
			});
		},
	});
};

export const useLikePost = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			postId,
			likesArray,
		}: {
			postId: string;
			likesArray: string[];
		}) => likePost(postId, likesArray),
		onSuccess: (data) => {
			queryClient.invalidateQueries({
				queryKey: [QUERY_KEYS.GET_POST_BY_ID, data?.$id],
			});
			queryClient.invalidateQueries({
				queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
			});
			queryClient.invalidateQueries({
				queryKey: [QUERY_KEYS.GET_POSTS],
			});
			queryClient.invalidateQueries({
				queryKey: [QUERY_KEYS.GET_CURRENT_USER],
			});
		},
	});
};

export const useSavePost = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ userId, postId }: { userId: string; postId: string }) =>
			savePost(userId, postId),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
			});
			queryClient.invalidateQueries({
				queryKey: [QUERY_KEYS.GET_POSTS],
			});
			queryClient.invalidateQueries({
				queryKey: [QUERY_KEYS.GET_CURRENT_USER],
			});
		},
	});
};

export const useDeleteSavedPost = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (savedRecordId: string) => deleteSavedPost(savedRecordId),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
			});
			queryClient.invalidateQueries({
				queryKey: [QUERY_KEYS.GET_POSTS],
			});
			queryClient.invalidateQueries({
				queryKey: [QUERY_KEYS.GET_CURRENT_USER],
			});
		},
	});
};

// ============================================================
// USER QUERIES
// ============================================================

export const useGetCurrentUser = () => {
	return useQuery({
		queryKey: [QUERY_KEYS.GET_CURRENT_USER],
		queryFn: getCurrentUser,
	});
};

export const useGetUsers = (limit?: number) => {
	return useQuery({
		queryKey: [QUERY_KEYS.GET_USERS],
		queryFn: () => getUsers(limit),
	});
};

export const useGetUserById = (userId: string) => {
	return useQuery({
		queryKey: [QUERY_KEYS.GET_USER_BY_ID, userId],
		queryFn: () => getUserById(userId),
		enabled: !!userId,
	});
};

export const useUpdateUser = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (user: IUpdateUser) => updateUser(user),
		onSuccess: (data) => {
			queryClient.invalidateQueries({
				queryKey: [QUERY_KEYS.GET_CURRENT_USER],
			});
			queryClient.invalidateQueries({
				queryKey: [QUERY_KEYS.GET_USER_BY_ID, data?.$id],
			});
		},
	});
};

export const useFollowUser = (p0: { onSuccess: () => void }) => {
	const queryClient = useQueryClient();

	return useMutation<unknown, Error, IFollower>({
		mutationFn: ({ followerId, followingId }: IFollower) => {
			console.log(
				`Użytkownik ${followerId} zaczyna obserwować użytkownika ${followingId}`
			);
			return followUser({ followerId, followingId });
		},
		onSuccess: (_, { followingId }) => {
			console.log(
				'Pomyślnie zaobserwowano użytkownika. Odświeżam statystyki obserwujących...'
			);
			// Odśwież statystyki follow dla konkretnego użytkownika
			queryClient.invalidateQueries({
				queryKey: [QUERY_KEYS.FOLLOW_STATS, followingId],
			});
		},
		onError: (error: Error) => {
			console.error('Błąd podczas obserwowania użytkownika:', error);
		},
	});
};

export const useUnfollowUser = (p0: { onSuccess: () => void }) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: unfollowUser,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.IS_FOLLOWING] });
			queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.FOLLOW_STATS] });
		},
		onError: (error: Error) => {
			console.error('Error unfollowing user:', error);
		},
	});
};

interface FollowStats {
	followersCount: number;
	followingCount: number;
}

export const useGetFollowStats = (userId: string) => {
	return useQuery<FollowStats>({
		queryKey: [QUERY_KEYS.FOLLOW_STATS, userId],
		queryFn: () => getFollowStats(userId),
		enabled: !!userId,
	});
};

export const useIsFollowing = (followerId: string, followingId: string) => {
	return useQuery({
		queryKey: ['isFollowing', followerId, followingId],
		queryFn: () => isFollowingUser(followerId, followingId),
		enabled: !!followerId && !!followingId,
	});
};
