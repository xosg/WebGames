
// alert("版本14.0预告：更新以下内容。\n1.设计得分系统\n2.加入\"冲刺\"技能\n3.修复数字小数格式补丁\n4.笔尖瞬移技能\n5.本地存储功能");

let wallX=[[]];
let wallY=[[]];

var wall=new Array();
var shortest_path=new Array();


var wall_size=3;
var square_size=12;
var amount_x=50;
var amount_y=50;


var direction=new Array();
var already_path=new Array();

var state="draw";
var get;

let origin;
let destination;
let pen;

let canvas;

window.onload=function(){

    canvas=document.getElementById("canvas");
    origin=document.getElementById('origin');
    destination=document.getElementById("destination");
    var wall_color=document.getElementById("wall_color");
    var path_color=document.getElementById("path_color");
    var pen_x=document.getElementById("pen_x");
    var pen_y=document.getElementById("pen_y");
    var ori_x=document.getElementById("ori_x");
    var ori_y=document.getElementById("ori_y");
    var des_x=document.getElementById("des_x");
    var des_y=document.getElementById("des_y");

    pen=document.getElementById('pen');







    document.getElementById("canvas_color").onchange=function(){
        canvas.style.backgroundColor=this.value;
    }


    document.getElementById("origin_color").onchange=function(){
        origin.style.backgroundColor=this.value;
    }


    document.getElementById("destination_color").onchange=function(){
        destination.style.backgroundColor=this.value;
    }




    wall_color.onchange=function(){
        for(var i=0;i<=amount_x;i++)
            for(var j=0;j<=amount_y;j++)
            {
                if(wall[i][j].right==1)draw_wall(i+0.5,j);
                if(wall[i][j].down==1)draw_wall(i,j+0.5);
            }
        pen.style.backgroundColor=wall_color.value;
    }




    path_color.onchange=function(){
        for(var i=1;i<=amount_x;i++)
            for(var j=1;j<=amount_y;j++)
                if(already_path[i][j]==1)draw_path(i,j);

    }




    canvas.onclick=function(event){


        if((event.clientX-canvas.offsetLeft-wall_size)%(wall_size-(-square_size))<=square_size){
            if((event.clientY-canvas.offsetTop-wall_size)%(wall_size-(-square_size))<=square_size){
                if(already_path[Math.ceil((event.clientX-canvas.offsetLeft-wall_size)/(wall_size-(-square_size)))][Math.ceil((event.clientY-canvas.offsetTop-wall_size)/(wall_size-(-square_size)))]==1){
                    if(document.getElementById("move_origin").checked){
                        ori_x.value=Math.ceil((event.clientX-canvas.offsetLeft-wall_size)/(wall_size-(-square_size)));
                        ori_x_cha();
                        ori_y.value=Math.ceil((event.clientY-canvas.offsetTop-wall_size)/(wall_size-(-square_size)));
                        ori_y_cha();
                    }
                    else{
                        des_x.value=Math.ceil((event.clientX-canvas.offsetLeft-wall_size)/(wall_size-(-square_size)));
                        des_x_cha();
                        des_y.value=Math.ceil((event.clientY-canvas.offsetTop-wall_size)/(wall_size-(-square_size)));
                        des_y_cha();
                    }
                }
            }
        }
    }








    document.getElementById("wall_size").onchange=function(){
        wall_size=parseInt(this.value);
        canvas.width=0;
        canvas.height=0;
        set_canvas_size();
        pen.height= pen.width=wall_size;
        for(var i=0;i<=amount_x;i++)
            for(var j=0;j<=amount_y;j++){
                if(wall[i][j].right==1)draw_wall(i+0.5,j);
                if(wall[i][j].down==1)draw_wall(i,j+0.5);
            }
        set_origin_position();
        set_destination_position();
        set_pen_position();
    }





    document.getElementById("square_size").onchange=function(){
        square_size=parseInt(this.value);
        canvas.width=0;
        canvas.height=0;
        set_canvas_size();
        for(var i=0;i<=amount_x;i++)
            for(var j=0;j<=amount_y;j++){
                if(wall[i][j].right==1)draw_wall(i+0.5,j);
                if(wall[i][j].down==1)draw_wall(i,j+0.5);
            }

        origin.style.width=square_size+"px";
        origin.style.height=square_size+"px";
        destination.style.width=square_size+"px";
        destination.style.height=square_size+"px";
        set_origin_position();
        set_destination_position();
    }









    document.getElementById("amount_x").onchange=function amo_x_cha(){
        amount_x=parseInt(this.value);
        set_canvas_size();
        clear_canvas();
        draw_border_wall();
        ori_x.max=amount_x;
        ori_x.value=1;
        ori_y.value=1;
        des_x.max=amount_x;
        des_x.value=amount_x;
        des_y.value=amount_y;
        pen_x.max=amount_x;
        pen_x.value=0.5;
        pen_y.value=0.5;
        ori_x_cha();ori_y_cha();des_x_cha();des_y_cha();
        set_pen_position();
    }








    document.getElementById("amount_y").onchange=function amo_y_cha(){
        amount_y=parseInt(this.value);
        set_canvas_size();
        clear_canvas();
        draw_border_wall();
        ori_y.max=amount_y;
        ori_x.value=1;
        ori_y.value=1;
        des_y.max=amount_y;
        des_x.value=amount_x;
        des_y.value=amount_y;
        pen_y.max=amount_y;
        pen_x.value=0.5;
        pen_y.value=0.5;
        ori_x_cha();ori_y_cha();des_x_cha();des_y_cha();
        set_pen_position();
    }



//初始化初始化初始化初始化初始化初始化初始化初始化初始化初始化初始化初始化初始化初始化初始化初始化


    for(var i=0;i<=100;i++){
        wall[i]=new Array();
        for(var j=0;j<=100;j++)
            wall[i][j]=new Object();
    }


    for(var i=1;i<=100;i++){
        already_path[i]=new Array();
    }
    clear_already();

    draw_border_wall();


    origin.style.top=canvas.offsetTop-(-wall_size)+"px";
    origin.style.left=canvas.offsetLeft-(-wall_size)+"px";
    // $('#point').css({'top':canvas.offsetTop,'left':canvas.offsetLeft});




//初始化初始化初始化初始化初始化初始化初始化初始化初始化初始化初始化初始化初始化初始化初始化初始化




}




function draw_all_walls() {
    let ctx=canvas.getContext("2d");
    ctx.fillStyle=wall_color.value;
    for (let i=0;i<amount_x;i++){
        for(let j=0;j<amount_y+1;j++){

        }
    }
}








function ori_x_cha(){
    set_origin_position();
}


function ori_y_cha(){
    set_origin_position();
}





function des_x_cha(){
    set_destination_position();
}


function des_y_cha(){
    set_destination_position();
}





function pen_x_change(){
    set_pen_position();
}

function pen_y_change(){
    set_pen_position();
}






function set_canvas_size(){
    canvas.width=amount_x*square_size+(amount_x+1)*wall_size;
    canvas.height=amount_y*square_size+(amount_y+1)*wall_size;

}







function set_origin_position(){
    origin.style.left=(canvas.offsetLeft+(parseInt(ori_x.value)-1)*square_size+parseInt(ori_x.value)*wall_size)+"px";
    origin.style.top=(canvas.offsetTop+(parseInt(ori_y.value)-1)*square_size+parseInt(ori_y.value)*wall_size)+"px";
}



function set_destination_position(){
    destination.style.left=(canvas.offsetLeft+(parseInt(des_x.value)-1)*square_size+parseInt(des_x.value)*wall_size)+"px";
    destination.style.top=(canvas.offsetTop+(parseInt(des_y.value)-1)*square_size+parseInt(des_y.value)*wall_size)+"px";
}

function set_pen_position(){
    pen.style.left=(canvas.offsetLeft+(parseInt(pen_x.value))*square_size+parseInt(pen_x.value)*wall_size)+"px";
    pen.style.top=(canvas.offsetTop+(parseInt(pen_y.value))*square_size+parseInt(pen_y.value)*wall_size)+"px";
}





function clear_canvas(){
    var ctx=canvas.getContext("2d");
    ctx.clearRect(0,0,amount_x*square_size+(amount_x+1)*wall_size,amount_y*square_size+(amount_y+1)*wall_size);
    for(var i=0;i<=amount_x;i++)
        for(var j=0;j<=amount_y;j++){
            wall[i][j].right=0;
            wall[i][j].down=0;
        }
    for(var i=1;i<=amount_x;i++)
        for(var j=1;j<=amount_y;j++)
            already_path[i][j]=0;
}






function draw_border_wall(){
    for(var i=1;i<=amount_x;i++){
        draw_wall(i,0.5);draw_wall(i,amount_y+0.5);
    }
    for(var i=1;i<=amount_y;i++){
        draw_wall(0.5,i);draw_wall(amount_x+0.5,i);
    }
}








function paint(){
    clear_canvas();
    draw_border_wall();
    document.getElementById("generate").removeAttribute("disabled");
    document.getElementById("advanced_generate").removeAttribute("disabled");
    document.getElementById("move_origin").disabled="true";
    document.getElementById("move_destination").disabled="true";
    ori_x.removeAttribute("disabled");
    ori_y.removeAttribute("disabled");
    des_x.removeAttribute("disabled");
    des_y.removeAttribute("disabled");
    document.getElementById("move_pen").removeAttribute("disabled");
    pen_x.removeAttribute("disabled");
    pen_y.removeAttribute("disabled");
    document.getElementById("wall_size").removeAttribute("disabled");
    document.getElementById("square_size").removeAttribute("disabled");
    document.getElementById("amount_x").removeAttribute("disabled");
    document.getElementById("amount_y").removeAttribute("disabled");
    document.getElementById("move_pen").checked="true";
    state="draw";
}








function generate(){
    if(state=="play"){random_draw_wall();return null;}
    state="play";
    clear_already();
    document.getElementById("advanced_generate").disabled="true";
    ori_x.disabled="true";
    ori_y.disabled="true";
    des_x.disabled="true";
    des_y.disabled="true";
    document.getElementById("move_pen").disabled="true";
    pen_x.disabled="true";
    pen_y.disabled="true";
    document.getElementById("wall_size").disabled="true";
    document.getElementById("square_size").disabled="true";
    document.getElementById("amount_x").disabled="true";
    document.getElementById("amount_y").disabled="true";
    document.getElementById("move_origin").removeAttribute("disabled");
    document.getElementById("move_destination").removeAttribute("disabled");
    document.getElementById("move_origin").checked="true";
    shortest_path.length=0;
    shortest_path[0]=new Object();
    shortest_path[0].x=parseInt(ori_x.value);
    shortest_path[0].y=parseInt(ori_y.value);
    already_path[parseInt(ori_x.value)][parseInt(ori_y.value)]=1;

    run();
    random_draw_wall();
    clear_already();
}



function advanced_generate(){
    state="play";
    clear_already();
    document.getElementById("generate").disabled="true";
    ori_x.disabled="true";
    ori_y.disabled="true";
    des_x.disabled="true";
    des_y.disabled="true";
    document.getElementById("move_pen").disabled="true";
    pen_x.disabled="true";
    pen_y.disabled="true";
    document.getElementById("wall_size").disabled="true";
    document.getElementById("square_size").disabled="true";
    document.getElementById("amount_x").disabled="true";
    document.getElementById("amount_y").disabled="true";
    document.getElementById("move_origin").removeAttribute("disabled");
    document.getElementById("move_destination").removeAttribute("disabled");
    document.getElementById("move_origin").checked="true";
    shortest_path.length=0;
    shortest_path[0]=new Object();
    shortest_path[0].x=parseInt(des_x.value);
    shortest_path[0].y=parseInt(des_y.value);
    already_path[parseInt(des_x.value)][parseInt(des_y.value)]=1;
    get="no";
    advanced_run();
    if(get!="yes")alert("亲，请检查起点和终点是否被墙残忍地分隔异地，or小编无法为您设计迷宫哦！");
    clear_already();
}







function draw_wall(x,y){
    var ctx=canvas.getContext("2d");
    ctx.fillStyle=wall_color.value;
    if(x%1==0&&y%1==0.5){
        ctx.fillRect((x-1)*square_size+x*wall_size,parseInt(y)*(square_size+wall_size),square_size,wall_size);
        wall[x][y-0.5].down=1;
    }
    if(x%1==0.5&&y%1==0){
        ctx.fillRect(parseInt(x)*(square_size+wall_size),(y-1)*square_size+y*wall_size,wall_size,square_size);
        wall[x-0.5][y].right=1;
    }
}






function draw_path(x,y){
    var ctx=canvas.getContext("2d");
    ctx.fillStyle=path_color.value;
    if(x%1==0&&y%1==0){
        ctx.fillRect((x-1)*square_size+x*wall_size,(y-1)*square_size+y*wall_size,square_size,square_size);
    }
    already_path[x][y]=1;
}


function clear_path(x,y){
    var ctx=canvas.getContext("2d");
    if(x%1==0&&y%1==0){
        ctx.clearRect((x-1)*square_size+x*wall_size,(y-1)*square_size+y*wall_size,square_size,square_size);
    }
    already_path[x][y]=0;
}











function clear_already(){

    for(var i=1;i<=amount_x;i++)
        for(var j=1;j<=amount_y;j++)
            if(already_path[i][j]==1)clear_path(i,j);
}






document.body.onkeydown=function(key){
    if(document.getElementById("move_origin").checked){
        if(document.getElementById("record").checked)
            draw_path(parseInt(ori_x.value),parseInt(ori_y.value));
        switch(key.keyCode){
            case 37:if(wall[parseInt(ori_x.value)-1][parseInt(ori_y.value)].right%2==0){
                ori_x.value--;
                ori_x_cha();
            }break;
            case 38:if(wall[parseInt(ori_x.value)][parseInt(ori_y.value)-1].down%2==0){
                ori_y.value--;
                ori_y_cha();
            }break;
            case 39:if(wall[parseInt(ori_x.value)][parseInt(ori_y.value)].right%2==0){
                ori_x.value++;
                ori_x_cha();
            }break;
            case 40:if(wall[parseInt(ori_x.value)][parseInt(ori_y.value)].down%2==0){
                ori_y.value++;
                ori_y_cha();
            }break;
            default:break;
        }
        if(parseInt(ori_x.value)==parseInt(des_x.value)&&parseInt(ori_y.value)==parseInt(des_y.value))
            alert("you win!");

    }
    if(document.getElementById("move_destination").checked){
        if(document.getElementById("record").checked)
            draw_path(parseInt(des_x.value),parseInt(des_y.value));
        switch(key.keyCode){
            case 37:if(wall[parseInt(des_x.value)-1][parseInt(des_y.value)].right%2==0){
                des_x.value--;
                des_x_cha();
            }break;
            case 38:if(wall[parseInt(des_x.value)][parseInt(des_y.value)-1].down%2==0){
                des_y.value--;
                des_y_cha();
            }break;
            case 39:if(wall[parseInt(des_x.value)][parseInt(des_y.value)].right%2==0){
                des_x.value++;
                des_x_cha();
            }break;
            case 40:if(wall[parseInt(des_x.value)][parseInt(des_y.value)].down%2==0){
                des_y.value++;
                des_y_cha();
            }break;
            default:break;
        }
        if(parseInt(ori_x.value)==parseInt(des_x.value)&&parseInt(ori_y.value)==parseInt(des_y.value))
            alert("you win!");
    }
    if(document.getElementById("move_pen").checked){
        switch(key.keyCode){
            case 37:if(pen_x.value>=1.5){draw_wall(pen_x.value-0.5,pen_y.value);--pen_x.value;}break;
            case 38:if(pen_y.value>=1.5){draw_wall(pen_x.value,pen_y.value-0.5);--pen_y.value;}break;
            case 39:if(pen_x.value<=amount_x-0.5){draw_wall(pen_x.value-(-0.5),pen_y.value);++pen_x.value;}break;
            case 40:if(pen_y.value<=amount_y-0.5){draw_wall(pen_x.value,pen_y.value-(-0.5));++pen_y.value;}break;
            default:break;
        }
        set_pen_position();
    }
}





function run(){

    if(shortest_path.length==0){
        alert("亲，请检查起点和终点是否被墙残忍地分隔异地，or小编无法为您设计迷宫哦！");return null;
    }
    if(shortest_path[shortest_path.length-1].x==parseInt(des_x.value)&&shortest_path[shortest_path.length-1].y==parseInt(des_y.value))return null;
    look_around();
    var t=shortest_path.length;
    if(direction.length==0){
        shortest_path.pop();
        run();
    }
    else {		        shortest_path[t]=new Object();
        switch(direction[parseInt(direction.length*Math.random())]){
            case 37:shortest_path[t].x=shortest_path[t-1].x-1;shortest_path[t].y=shortest_path[t-1].y;already_path[shortest_path[t].x][shortest_path[t].y]=1;break;
            case 38:shortest_path[t].x=shortest_path[t-1].x;shortest_path[t].y=shortest_path[t-1].y-1;already_path[shortest_path[t].x][shortest_path[t].y]=1;break;
            case 39:shortest_path[t].x=shortest_path[t-1].x+1;shortest_path[t].y=shortest_path[t-1].y;already_path[shortest_path[t].x][shortest_path[t].y]=1;break;
            case 40:shortest_path[t].x=shortest_path[t-1].x;shortest_path[t].y=shortest_path[t-1].y+1;already_path[shortest_path[t].x][shortest_path[t].y]=1;break;
            default:break;
        }run();}
}






function advanced_run(){
    if(shortest_path.length==0){
        return null;
    }
    look_around();
    var t=shortest_path.length;
    if(direction.length==0){
        shortest_path.pop();advanced_run();
    }
    else{
        for(var i=0;i<direction.length;i++){
            switch(direction[i]){
                case 37:draw_wall(shortest_path[t-1].x-0.5,shortest_path[t-1].y);wall[shortest_path[t-1].x-1][shortest_path[t-1].y].right=3;break;
                case 38:draw_wall(shortest_path[t-1].x,shortest_path[t-1].y-0.5);wall[shortest_path[t-1].x][shortest_path[t-1].y-1].down=3;break;
                case 39:draw_wall(shortest_path[t-1].x+0.5,shortest_path[t-1].y);wall[shortest_path[t-1].x][shortest_path[t-1].y].right=3;break;
                case 40:draw_wall(shortest_path[t-1].x,shortest_path[t-1].y+0.5);wall[shortest_path[t-1].x][shortest_path[t-1].y].down=3;break;
                default:break;
            }
        }

        shortest_path[t]=new Object();


        switch(direction[parseInt(direction.length*Math.random())]){
            case 37:shortest_path[t].x=shortest_path[t-1].x-1;shortest_path[t].y=shortest_path[t-1].y;already_path[shortest_path[t].x][shortest_path[t].y]=1;break;
            case 38:shortest_path[t].x=shortest_path[t-1].x;shortest_path[t].y=shortest_path[t-1].y-1;already_path[shortest_path[t].x][shortest_path[t].y]=1;break;
            case 39:shortest_path[t].x=shortest_path[t-1].x+1;shortest_path[t].y=shortest_path[t-1].y;already_path[shortest_path[t].x][shortest_path[t].y]=1;break;
            case 40:shortest_path[t].x=shortest_path[t-1].x;shortest_path[t].y=shortest_path[t-1].y+1;already_path[shortest_path[t].x][shortest_path[t].y]=1;break;
            default:break;
        }

        clear_wall((shortest_path[t].x+shortest_path[t-1].x)/2,(shortest_path[t].y+shortest_path[t-1].y)/2);

        if(shortest_path[t].x==parseInt(ori_x.value)&&shortest_path[t].y==parseInt(ori_y.value)){
            get="yes";
        }
        advanced_run();
    }
}





function clear_wall(x,y){
    var ctx=canvas.getContext("2d");
    if(x%1==0&&y%1==0.5){
        ctx.clearRect((x-1)*square_size+x*wall_size,parseInt(y)*(square_size+wall_size),square_size,wall_size);
        wall[x][y-0.5].down=0;
    }
    if(x%1==0.5&&y%1==0){
        ctx.clearRect(parseInt(x)*(square_size+wall_size),(y-1)*square_size+y*wall_size,wall_size,square_size);
        wall[x-0.5][y].right=0;
    }

}


function del_array(array,data){
    for(var i=0;i<array.length;i++){
        if(array[i]==data)array.splice(i,1);
    }
}






function look_around(){
    direction.length=4;
    direction[0]=37;direction[1]=38;direction[2]=39;direction[3]=40;

    if(wall[shortest_path[shortest_path.length-1].x][shortest_path[shortest_path.length-1].y].right==1||already_path[shortest_path[shortest_path.length-1].x+1][shortest_path[shortest_path.length-1].y]==1)del_array(direction,39);
    if(wall[shortest_path[shortest_path.length-1].x][shortest_path[shortest_path.length-1].y].down==1||already_path[shortest_path[shortest_path.length-1].x][shortest_path[shortest_path.length-1].y+1]==1)del_array(direction,40);
    if(wall[shortest_path[shortest_path.length-1].x][shortest_path[shortest_path.length-1].y-1].down==1||already_path[shortest_path[shortest_path.length-1].x][shortest_path[shortest_path.length-1].y-1]==1)del_array(direction,38);
    if(wall[shortest_path[shortest_path.length-1].x-1][shortest_path[shortest_path.length-1].y].right==1||already_path[shortest_path[shortest_path.length-1].x-1][shortest_path[shortest_path.length-1].y]==1)del_array(direction,37);
}




function random_draw_wall(){
    forbidden_wall();
    for(var i=0;i<=amount_x;i++)
        for(var j=0;j<=amount_y;j++){
            if(wall[i][j].right!=2){
                if(Math.random()>=0.5)draw_wall(i+0.5,j);
            }
            if(wall[i][j].down!=2){
                if(Math.random()>=0.5)draw_wall(i,j+0.5);
            }
        }
}



function forbidden_wall(){
    for(var i=1;i<shortest_path.length;i++){
        if(shortest_path[i-1].x==shortest_path[i].x){
            if(shortest_path[i-1].y-1==shortest_path[i].y)
                wall[shortest_path[i].x][shortest_path[i].y].down=2;
            else wall[shortest_path[i-1].x][shortest_path[i-1].y].down=2;
        }
        else {
            if(shortest_path[i-1].x-1==shortest_path[i].x)
                wall[shortest_path[i].x][shortest_path[i].y].right=2;
            else wall[shortest_path[i-1].x][shortest_path[i-1].y].right=2;
        }
    }
}





