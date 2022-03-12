/* database creation */
create table users(
	user_id tinyint primary key auto_increment,
	username varchar(15)
);

create table tweets(
	tweet_id tinyint primary key auto_increment,
	author_id tinyint not null,
	content text,
	tweet_date timestamp,
	foreign key (author_id) references users(user_id)
);

create table follows(
	follower_id tinyint not null,
	followed_id tinyint not null,
	foreign key (followed_id) references users(user_id),
	foreign key (follower_id) references users(user_id)
);