(function()
{
  const config=
  {
    apiKey: "AIzaSyBVBviTsUBRT-mvzBwVul5Lzy7kSbtjUqU",
    authDomain: "project-a156d.firebaseapp.com",
    databaseURL: "https://project-a156d.firebaseio.com",
    projectId: "project-a156d",
    storageBucket: "project-a156d.appspot.com",
    messagingSenderId: "967997686089"
  }; //ini app
  firebase.initializeApp(config);
  const auth = firebase.auth();
  const viewId = document.getElementById('viewId');
  const backSelect = document.getElementById('backSelect');
  const logout = document.getElementById('logout');
  const tableName = document.getElementById('tableNamte');
  const foodsName = document.getElementById('foodsName');
  const total = document.getElementById('total');
  const left = document.getElementById('left');
  const payment = document.getElementById('payment');
  const menu = document.getElementById('menu');
  const identify = document.getElementById('identify');
  database= firebase.database(); //database init

  //실시간으로 user의 인증 정보를 체크
 //firebaseUser는 모든 Firebase의 사용자
 //로그인 안했을시 firebaseUser의 값은 NULL
 firebase.auth().onAuthStateChanged(firebaseUser => {
   if(firebaseUser){
     //로그인 성공
     userInfo = firebaseUser
     userEmail = firebaseUser.email
     //E-mail중 아이디만 가져옴
     var at=0;
     for(var i=0; i<userEmail.length;i++)
     {
       if(userEmail.charAt(i)=='@')
       {
         at=i;
         break;
       }
     }
     id=userEmail.substring(0,at);
     viewId.innerText=id+"님 어서오세요"
     createButton();
   }else {
     //로그인 실패 및 로그인이 안되었을떄 로그인 페이지로 이동
     document.location.href="/index.html";
   }
 });

//버튼을 클릭시 select.html로 이동
backSelect.addEventListener('click', e=>
{
  document.location.href="/select.html"
});
//logout 버튼 클릭시 logout 하고 index.html로 이동
logout.addEventListener('click', e=>
{
  firebase.auth().signOut();
  window.alert("로그아웃 되었습니다.");
  document.location.href="/index.html";
});
//현재 있는 음식 이름 삭제 하는 함수
function deleteFoods()
{
  //appen라는 id를 가진 태그 요소 삭제
  //append 라는 ID를 가진 요소가 없을때에는 NULL이 리턴됨
  //foodsName 테이블의 요소를 while문으로 찾아가면서 삭제
  var append = document.getElementById('append');
  if(append!=null)
  {
    while(foodsName.childElementCount)
    {
     foodsName.firstElementChild.remove();
    }
    total.innerText='0';
  }
}

//buuton을 생성하는 함수
function createButton()
{
  //좌석수를 가져오기 위한 참조
  const seat = database.ref(id+'/seat');
  seat.on('value', snap=>
  {
    const seatCount = snap.val();
    //기존에 있던 버튼을 지우는 작업
    var count = left.childElementCount;
    for(var i=0; i<count; i++)
    {
      left.firstElementChild.remove();
    }
    //for문으로 좌석수만큼의 버튼을 생성하는 함수
    for(var i=0; i<snap.val(); i++)
    {
      //left의 아이디를 갖는 태그 밑에 버튼을 추가
      var html =
      "<button class=\"table button\" id=\"t" +(i+1)+ "\"> " +(i+1)+ " 테이블 </button>";
      $("#left").append(html);
      //생성된 태그에 대해 콜백 리스너 등록
      listener(i+1);
    }
    orderList();
  });
}

//인자로 받아온 테이블 번호에 대해 콜백 리스너에 등록하는 함수
function listener(data)
{
  //생성된 테이블의 번호의 아이디를 가져옴
  const listen = document.getElementById('t'+data);
  listen.addEventListener('click', e=>
  {
    // 테이블 이름 수정
    //현 접속한 id의 order에 접근
    $("#tableName>.title").text(data+"번째 테이블");
    //DB에 저장된 테이블의 번호에 대한 주문을 가져옴
    getOrder(data);

  });
}

 //tableNamem에 해당되는 data를 가져오는 함수
 function getOrder(tableNumber)
 {
  //해당 테이블에 주문이 있는지 확인한다.
  var check = database.ref(id + '/order');
  check.on('value', snap=>
  {
    //음식 이름 삭제
    deleteFoods();
    // 해당 테이블 번호에 주문이 없거나
    // 결제 처리가 완료된 테이블은 주문이 없는걸로 표시
    if(snap.child(tableNumber).val() == null)// || snap.child(tableNumber+'/complete').val() == "y")
    {
      //html 태그로 저장하여 append함수로 foodsname 태그에 추가
      var html =
      "<tr id=\"append\">"
      +"<td colspan=\"2\" class=\"title\"> 주문이 없습니다. </td>"
      +"</tr>";
      $("#foodsName").append(html);
    } else
    {
      //현재는 order의 테이블 번호 첨조
      //테이블 번호의 child인 foods 참조
      //음식 이름을 배열로 하나씩 저장
      //첫번째 테이블에 대하여 계산된 총액을 출력
      var orderRef = database.ref(id+'/order/'+tableNumber);
      orderRef.on('value', snap =>
      {
        snap.child('foods').forEach(function(childSnap)
        {
          const number = childSnap.val().number;
          const chSum = childSnap.val().sum;
          const fName = childSnap.key;
          var html =
          "<tr id=\"append\">"
          +"<th class=\"list_middle\">" +fName+ "</th>"
          +"<th class=\"list_right\">" +number+"개</th>"
          +"</tr>"
          +"<tr id=\"append\">"
          +"<td colspan=\"2\" class=\"sum\">"+ chSum +"</td>"
          +"</tr>";
          $("#foodsName").append(html);
        });
      const sum = snap.val().sum;
      total.innerText=sum;
      });
    }
  });
};

 //시작시 order가 있는 테이블의 버튼색을 변경
 function orderList()
 {
    var orderList = database.ref(id+'/order');
    orderList.on('value', snap=>
    {
      //for문으로 버튼이 존재하는지 확인 후 색을 변경
      var i=1;
      for(;document.getElementById('t'+i)!= null ; i++)
      {
        //해당 번호의 버튼에 해당되는 주문이 있을경우 색을 노란색으로 변경
        if(snap.child(i).val() != null)
        {
          //주문이 있는데 결제 처리가 안된것만 표시하도록
          //if(snap.child(i).val().complete=='n')
          //{
            var table = document.getElementById('t'+i);
            table.setAttribute("class", "ui inverted red button");
            table.style.margin = "10px";
          /*} else {
            //좌석에 주문이 있지만 결제 치리가 완료된것은 주문이 없는것으로 표시
            var table = document.getElementById('t'+i);
            table.setAttribute("class", "ui inverted olive button");
            table.style.color = "black";
            table.style.margin = "10px";
          }*/
        }
        else{
          //해당 번호의 버튼에 해당되는 주문이 없을 경우 색을 올리브으로 변경
          var table = document.getElementById('t'+i);
          table.setAttribute("class", "ui inverted olive button");
          table.style.color = "black";
          table.style.margin = "10px";
        }
      }
    });
 }

//결제완료 버튼을 누를떄
 payment.addEventListener('click', e=>
{
  //현제 시간 저장
  var now = new Date();
  var month = now.getMonth()+1;
  var date = now.getDate();
  var hours = now.getHours();
  var min = now.getMinutes();
  var sec = now.getSeconds();
  var time = month.toString()+date.toString()+hours.toString()+min.toString()+sec.toString();
  //버튼의 테이블 번호를 가져온다
  var tNumber = $("#tableName>.title").text();
  var string = tNumber.substring(0,tNumber.indexOf('번'));
  var ordRef = database.ref(id+'/order/'+string);
  ordRef.once('value', snap=>
  {
    snap.child('foods').forEach(function(childSnap)
    {
      //console.log(childSnap.key);
      var comRef = database.ref(id+'/complete/'+time+'/foods/'+childSnap.key);
      //현재 시간을 key로 하는 child를 complete 밑에 생성후 foods 내용을 저장
      comRef.set(
      {
        number: childSnap.val().number,
        sum :  childSnap.val().sum
      });
    });
    var comRef = database.ref(id+'/complete/'+time);
    //현재 시간을 key로 하는 child를 complete 밑에 seat과 sum을 저장
    comRef.update(
    {
      seat : string,
      sum : snap.val().sum
    });
  });

  //order 밑의 해당 좌석의 주문삭제
  ordRef.remove();
 });

//메뉴 확인 버튼을 눌렀을시 이동
 menu.addEventListener('click', e=>
 {
   document.location.href="/menu.html";
 });

 identify.addEventListener('click', e=>
 {
   document.location.href="/identify.html";
 });


}());
