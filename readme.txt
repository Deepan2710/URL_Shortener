# URL_Shortener
A url shortener ,where u can redirect with short length of url and get the UA details with no of time it used in certain topic of link   and get of overall url used and saved
****HOW TO USE****
As i used Localhost server no as 8080, check the apis with 8080(ex localhost:8080/)

once u entered in localhost:8080/ ,u can see a link login with google
click and login or create id with your gmail id (OAuth 2.0)

once u clicked successfully ,u redirect into localhost:8080/button api page
where u can see buttons,
1 st button is to post LongUrl and topic the url is related and all needed attributes are saved in mongodb and shortUrl is saved in redis cache...
2 nd button is redirect to the webpage of the shortUrl with help of redis cache system

3rd button is used to see the analytic of the specific shortUrl

4th button is used to see the analytic of the specific topic
5th button is used to see the overall analytic of all urls posted 

there are two schemes present one to save login user detials and another is to get the analytics details
