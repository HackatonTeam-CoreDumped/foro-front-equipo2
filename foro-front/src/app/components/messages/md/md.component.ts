import { Message } from './../../../interfaces/message';
import { HttpErrorResponse } from '@angular/common/http';
import { User } from 'src/app/interfaces/user';
import { Router } from '@angular/router';
import { RoutesService } from 'src/app/service/routes.service';
import { CookieService } from 'ngx-cookie-service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-md',
  templateUrl: './md.component.html',
  styleUrls: ['./md.component.css']
})
export class MDComponent implements OnInit {
  user:User;
  sendMessage: Message;
  messages:Message[];
  myMessages:Message[];
  editState:boolean=false;
  editId:string;

  constructor(
    private api: RoutesService,
    private router: Router,
    private cookieService: CookieService,
  ) { }

  ngOnInit() {
     // check the token in the cookies service
     const token = this.cookieService.get('token');
     this.api.authToken(token).subscribe((response:{data: User}) => {
       this.user= response.data;
      
       this.api.reciveMessage(this.user._id).subscribe((response) =>{
        this.messages=response['pm']
        for (let i = 0; i < this.messages.length ; i++) {
          this.api.getusername(this.messages[i].senderUsernameId).subscribe((response:{username:string})=>{
            this.messages[i].senderUsername = response.username;
          });
        }
       });


     }, (error: HttpErrorResponse) => {
       console.log('error tienes que iniciar sesion');
       this.router.navigateByUrl('/home');
       alert('You should be logged for access to messages');
     });
  }
  send(form,reciver){
    this.sendMessage = form.value;
    this.sendMessage.receiverUsernameId=reciver
    this.sendMessage.senderUsernameId = this.user._id
    console.log(this.sendMessage);
    
    this.api.sendMessage(this.sendMessage).subscribe((response)=>{
      console.log(response);
      
    });
  }
  edit(id){
    console.log(id);
      this.editState = !this.editState;
      this.editId = id;
  }
}
