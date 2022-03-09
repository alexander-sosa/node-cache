/* data inserts */
insert into users(username) values
('alexander.phx'),
('ecampohermoso'),
('teffi.rocks');

insert into follows values 
(1, 2),
(1, 3),
(2, 1),
(3, 2);

insert into tweets (author_id, content) values 
(1, "primer tweet"),
(2, "log4j vulnerabilities"),
(3, "gdsc new event");