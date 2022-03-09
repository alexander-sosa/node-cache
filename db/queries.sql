/* data view */
/* all tweets */
select tweets.content, users.username 
from tweets
left join users on users.user_id = tweets.author_id;

/* all follows */
select follower.username as follower, followed.username as followed
from follows
left join users follower on follower.user_id = follows.follower_id 
left join users followed on followed.user_id = follows.followed_id
where follower.user_id = 1;

/* feed */
select tweets.content, followed.username 
from tweets
left join users followed on followed.user_id = tweets.author_id
left join follows on followed.user_id = follows.followed_id 
left join users follower on follower.user_id = follows.follower_id 
where follows.follower_id = 3;