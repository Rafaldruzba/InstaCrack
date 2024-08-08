import {
	Route,
	Routes,
	Link,
	Outlet,
	useParams,
	useLocation,
} from 'react-router-dom';

import { LikedPosts } from '@/_root/pages';
import { useUserContext } from '@/context/AuthContext';
import {
	useFollowUser,
	useGetFollowStats,
	useGetUserById,
	useUnfollowUser,
} from '@/lib/react-query/queriesAndMutations';
import Loader from '@/components/shared/Loader';
import { Button } from '@/components/ui/button';
import GridPostList from '@/components/shared/GridPostList';

import { useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/react-query/queryKeys';

interface StabBlockProps {
	value: string | number;
	label: string;
}

const StatBlock = ({ value, label }: StabBlockProps) => (
	<div className='flex-center gap-2'>
		<p className='small-semibold lg:body-bold text-primary-500'>{value}</p>
		<p className='small-medium lg:base-medium text-light-2'>{label}</p>
	</div>
);

const Profile = () => {
	const { id: currentUserId } = useParams(); // ID użytkownika, którego profil przeglądamy
	const { user } = useUserContext();
	const { pathname } = useLocation();
	const queryClient = useQueryClient();

	// const { mutate: unfollowUser } = useUnfollowUser();
	const { data: followStats } = useGetFollowStats(currentUserId || '');
	const { mutate: followUser } = useFollowUser({
		onSuccess: () => {
			queryClient.invalidateQueries([QUERY_KEYS.FOLLOW_STATS, currentUserId]);
		},
	});
	const { mutate: unfollowUser } = useUnfollowUser({
		onSuccess: () => {
			queryClient.invalidateQueries([QUERY_KEYS.FOLLOW_STATS, currentUserId]);
		},
	});
	const { data: currentUser } = useGetUserById(currentUserId || '');

	const isFollowing = followStats?.followers.some(
		(follower) => follower.followerId === user?.id
	);

	console.log(isFollowing);

	const handleFollowClick = () => {
		if (!user || !currentUserId) return; // Upewniamy się, że oba ID są dostępne

		if (isFollowing) {
			unfollowUser({ followerId: user.id, followingId: currentUserId });
		} else {
			followUser({ followerId: user.id, followingId: currentUserId });
		}
	};

	if (!currentUser)
		return (
			<div className='flex-center w-full h-full'>
				<Loader />
			</div>
		);

	return (
		<div className='profile-container'>
			<div className='profile-inner_container'>
				<div className='flex xl:flex-row flex-col max-xl:items-center flex-1 gap-7'>
					<img
						src={
							currentUser.imageUrl || '/assets/icons/profile-placeholder.svg'
						}
						alt='profile'
						className='w-28 h-28 lg:h-36 lg:w-36 rounded-full'
					/>
					<div className='flex flex-col flex-1 justify-between md:mt-2'>
						<div className='flex flex-col w-full'>
							<h1 className='text-center xl:text-left h3-bold md:h1-semibold w-full'>
								{currentUser.name}
							</h1>
							<p className='small-regular md:body-medium text-light-3 text-center xl:text-left'>
								@{currentUser.username}
							</p>
						</div>

						<div className='flex gap-8 mt-10 items-center justify-center xl:justify-start flex-wrap z-20'>
							<StatBlock value={currentUser.posts.length} label='Posts' />
							<StatBlock
								value={followStats?.followersCount || 0}
								label='Followers'
							/>
							<StatBlock
								value={followStats?.followingCount || 0}
								label='Following'
							/>
						</div>

						<p className='small-medium md:base-medium text-center xl:text-left mt-7 max-w-screen-sm'>
							{currentUser.bio}
						</p>
					</div>

					<div className='flex justify-center gap-4'>
						<div className={`${user.id !== currentUser.$id && 'hidden'}`}>
							<Link
								to={`/update-profile/${currentUser.$id}`}
								className={`h-12 bg-dark-4 px-5 text-light-1 flex-center gap-2 rounded-lg ${
									user.id !== currentUser.$id && 'hidden'
								}`}
							>
								<img
									src={'/assets/icons/edit.svg'}
									alt='edit'
									width={20}
									height={20}
								/>
								<p className='flex whitespace-nowrap small-medium'>
									Edit Profile
								</p>
							</Link>
						</div>
						<div className={`${user.id === currentUserId && 'hidden'}`}>
							<Button
								type='button'
								className={`${
									isFollowing ? 'bg-primary-600' : 'bg-primary-500'
								} hover:bg-primary-500 text-light-1 flex gap-2 px-8`}
								onClick={handleFollowClick}
							>
								{isFollowing ? 'Unfollow' : 'Follow'}
							</Button>
						</div>
					</div>
				</div>
			</div>

			{currentUser.$id === user.id && (
				<div className='flex max-w-5xl w-full'>
					<Link
						to={`/profile/${currentUserId}`}
						className={`profile-tab rounded-l-lg ${
							pathname === `/profile/${currentUserId}` && '!bg-dark-3'
						}`}
					>
						<img
							src={'/assets/icons/posts.svg'}
							alt='posts'
							width={20}
							height={20}
						/>
						Posts
					</Link>
					<Link
						to={`/profile/${currentUserId}/liked-posts`}
						className={`profile-tab rounded-r-lg ${
							pathname === `/profile/${currentUserId}/liked-posts` &&
							'!bg-dark-3'
						}`}
					>
						<img
							src={'/assets/icons/like.svg'}
							alt='like'
							width={20}
							height={20}
						/>
						Liked Posts
					</Link>
				</div>
			)}

			<Routes>
				<Route
					index
					element={<GridPostList posts={currentUser.posts} showUser={false} />}
				/>
				{currentUser.$id === user.id && (
					<Route path='/liked-posts' element={<LikedPosts />} />
				)}
			</Routes>
			<Outlet />
		</div>
	);
};

export default Profile;
