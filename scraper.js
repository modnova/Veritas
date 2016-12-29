/*Importany Article Information
-------------------------------
1:title
2:link
3:descr
4:website
5:author
6:caption
*/

//Set of arrays containing all of the article information on a page
var feed=new Set();

function scrape(){
  page = document.getElementsByClassName('mbs _6m6 _2cnj _5s6c');
  for(var i=0;i<page.length;i++)
  {
    //Info array
    var info=new Array(6);
    var article=page[i];

    var title=article.querySelector("a").text;
    info[0]=title;

    var link=article.querySelector("a").href;
    info[1]=link;

    var descr=document.getElementsByClassName("_6m7 _3bt9")[i].textContent;
    info[2]=descr;

    var website=document.getElementsByClassName("_6lz _6mb ellipsis")[i].textContent;
    info[3]=website;

    var author=document.getElementsByClassName("_4l5i fsm fwn fcg")[i];
    //info[4]=author;
    console.log(author);



    if(!feed.has(info))
      feed.add(info);
  }

}


$(document).ready(function(){
  scrape();
});


$(window).on('scroll', function() {
  scrape();
});
