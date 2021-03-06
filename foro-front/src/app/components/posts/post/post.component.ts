import { Component, OnInit } from '@angular/core';
import { RoutesService } from 'src/app/service/routes.service';
import { Router } from '@angular/router';
import { Post } from 'src/app/interfaces/post';
import { User } from 'src/app/interfaces/user';
import { Comment } from 'src/app/interfaces/comment';
import { CookieService } from 'ngx-cookie-service';
import { HttpErrorResponse } from '@angular/common/http';
@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.css']
})
export class PostComponent implements OnInit {
  
  comments: Comment[];
  comment: Comment;
  post: Post;
  user:User;
  editState:boolean=false;
  editId:string;
  pageNo:number = 1;

  constructor(private api: RoutesService, private router: Router, private cookieService: CookieService) { }

  ngOnInit() {
    // Get the post
    console.log(this.api.postId);
    this.api.getPostById(this.api.postId).subscribe((response)=>{
      this.post= response['post'];
      this.api.getusername(this.post.usernameId).subscribe((response:{username:string}) =>{
        this.post.username = response.username;
      });
    });
    // Get the comments by postId
  this.api.getComments(this.api.postId,this.pageNo).subscribe(data =>{
    this.comments = data['comments'];
    for (let i = 0; i < this.comments.length ; i++) {
      this.api.getusername(this.comments[i].usernameId).subscribe((response:{username:string})=>{
        this.comments[i].username = response.username;
      });
    }
  });

      // Check the token in cookies
      const token = this.cookieService.get('token');
      this.api.authToken(token).subscribe((response:{data: User}) => {
        this.user= response.data;
      }, (error: HttpErrorResponse) => {
        console.log('No puedes comentar sin logearte');
        alert('You must be logged to comment in posts');
      });
  }

  reload(){
    console.log(this.api.postId);
    this.api.getPostById(this.api.postId).subscribe((response)=>{
      this.post= response['post'];
      this.api.getusername(this.post.usernameId).subscribe((response:{username:string}) =>{
        this.post.username = response.username;
      });
    });
    // Get the comments by postId
    console.log(this.api.postId);
  this.api.getComments(this.api.postId,this.pageNo).subscribe(data =>{
    console.log(data);
    
    this.comments = data['comments'];
    for (let i = 0; i < this.comments.length ; i++) {
      this.api.getusername(this.comments[i].usernameId).subscribe((response:{username:string})=>{
        this.comments[i].username = response.username;
      });
    }
  });
  }

  response(form): void{
    this.comment = form.value;
    this.comment.postId = this.api.postId;
    this.comment.usernameId = this.user._id;
    this.api.commentPost(this.comment).subscribe(res =>{
    this.reload();
    });
  }

  rate(data,id){
    var state:string;
    
    if (data == 1) {
      state="up";
    } else {
      if (data == -1) {
        state = "down";
      } else{
        state = "";
      }
    }
    this.user.voteType = state;

    this.api.Rating(this.user,id).subscribe(response =>{
    
     this.reload();
    })
  }

  delete(id){
    this.user.usernameId = this.user._id;
    this.api.deleteComment(this.user,id).subscribe(response =>{
      this.reload();
      
    })
  }
  edit(id){
      this.editState = !this.editState;
      this.editId = id;
  }
  patch(form,id,i){
    this.comments[i].content = form.value.content;
    this.api.editComment(id,this.comments[i]).subscribe((response) => {
      console.log(response);
      this.reload();
    })
  }

  pagination(result){
    this.pageNo = result;
    this.reload();
  }
  paginationForw(){
  this.pageNo= this.pageNo +1;
  console.log(this.pageNo)
  this.reload();
  }
  paginationBack(){
  this.pageNo--;
  console.log(this.pageNo)
  this.reload();
  }
}