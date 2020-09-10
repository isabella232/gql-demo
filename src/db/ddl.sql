create table bookinfo (
	bookID serial,
	title varchar(300),
	author varchar(300),
	inStock bool default false
)

insert into bookinfo(title, author, instock) values ('Harry Potter and the Chamber of Secrets','J.K. Rowling',true);
insert into bookinfo(title, author, instock) values ('Harry Potter and the Sorcerers Stone','J.K. Rowling',true);
insert into bookinfo(title, author, instock) values ('Jurassic Park','M. Crichton',true);

select bookID, title, author, inStock from bookinfo;