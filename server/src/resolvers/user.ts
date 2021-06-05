import { User as Userr } from "../entities/users";
import { MyContext } from "../types";
import {
  Resolver,
  Mutation,
  Arg,
  Field,
  Ctx,
  ObjectType,
  Query,
  FieldResolver,
  InputType,
  Root,
} from "type-graphql";
import argon2 from "argon2";
import { COOKIE_NAME, FORGET_PASSWORD_PREFIX } from "../constants";
import { validateRegister } from "../utils/validateRegister";
import { sendEmail } from "../utils/sendEmail";
import { v4 } from "uuid";
import { getConnection } from  "typeorm";
import { User } from "../entities/users";
@InputType()
class UsernamePasswordInput{
  @Field()
  username: string

  @Field()
  password: string

  @Field()
  email: string
}
@ObjectType()
class FieldError{
  @Field()
  field: string;

  @Field()
  message:string;
}
@ObjectType()
class UserResponse{
  @Field(()=> [FieldError], {nullable: true})
  errors?: FieldError[]

  @Field(()=> Userr, { nullable: true})
  user?: Userr
}

@Resolver(User)
export class UserResolver{
  @FieldResolver(() => String)
  email(@Root() user: User, @Ctx() { req }: MyContext) {
    // this is the current user and its ok to show them their own email
    if (req.session.userId === user.id) {
      return user.email;
    }
    // current user wants to see someone elses email
    return "";
  }
  @Query(()=> Userr, { nullable :true})
   me(
    @Ctx(){ req }: MyContext
  ){
    if(!req.session.userId){
      //not logged in
      console.log(req.session)
      return null
    }
    console.log(req.session)
    return Userr.findOne(req.session.userId);
    
  }

  @Mutation(() => UserResponse)
  async changePassword(
    @Arg("token") token: string,
    @Arg("newPassword") newPassword: string,
    @Ctx() { redis, req }: MyContext
  ): Promise<UserResponse> {
    if (newPassword.length <= 2) {
      return {
        errors: [
          {
            field: "newPassword",
            message: "length must be greater than 2",
          },
        ],
      };
    }

    const key = FORGET_PASSWORD_PREFIX + token;
    const userId = await redis.get(key);
    if (!userId) {
      return {
        errors: [
          {
            field: "token",
            message: "token expired",
          },
        ],
      };
    }

    const userIdNum = parseInt(userId);
    const user = await Userr.findOne(userIdNum);

    if (!user) {
      return {
        errors: [
          {
            field: "token",
            message: "user no longer exists",
          },
        ],
      };
    }
    await Userr.update(
      { id: userIdNum },
      {
        password: await argon2.hash(newPassword),
      }
    );

    await redis.del(key);

    // log in user after change password,
    req.session.userId = user.id;

    return { user };
  }

  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg("email") email: string,
    @Ctx() { redis,  }: MyContext
  ) {
    const user = await Userr.findOne({ where: { email }});
    if (!user) {
      // the email is not in the db
      return true;
    }

     const token =  v4();//'cndf;lknfklmjfldflkfl;kdfcdnknkdsnksnkkfdmsfl';//uuid refused to install
    console.log(token)
    await redis.set(
      FORGET_PASSWORD_PREFIX + token,
      user.id,
      "ex",
      1000 * 60 * 60 * 24 * 3// 3 days
    ); 

    await sendEmail(
      email,
      `<a href="http://localhost:3000/change-password/${token}">reset password</a>`
    );

    return true;
  }
 
  @Mutation(() => UserResponse)
  async register(
    @Arg("options") options: UsernamePasswordInput,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    const errors = validateRegister(options);
    if (errors) {
      return { errors };
    }

    const hashedPassword = await argon2.hash(options.password);
    let user;
    try {
      // User.create({}).save()
      const result = await getConnection()
        .createQueryBuilder()
        .insert()
        .into(Userr)
        .values({
          username: options.username,
          email: options.email,
          password: hashedPassword,
        })
        .returning("*")
        .execute();
      user = result.raw[0];
    } catch (err) {
      //|| err.detail.includes("already exists")) {
      // duplicate username error
      if (err.code === "23505") {
        return {
          errors: [
            {
              field: "username",
              message: "username already taken",
            },
          ],
        };
      }
    }

    // store user id session
    // this will set a cookie on the user
    // keep them logged in
    req.session.userId = user.id;

    return { user };
  } 
  @Mutation(() => UserResponse)
  async login(
    @Arg("usernameOrEmail") usernameOrEmail: string,
    @Arg("password") password: string,
    @Ctx() { req,res }: MyContext
  ): Promise<UserResponse> {
    const user = await Userr.findOne(
      usernameOrEmail.includes("@")
        ? { where: { email: usernameOrEmail } }
        : { where: { username: usernameOrEmail } }
    );
    if (!user) {
      return {
        errors: [
          {
            field: "usernameOrEmail",
            message: "that username doesn't exist",
          },
        ],
      };
    }
    const valid = await argon2.verify(user.password, password);
    if (!valid) {
      return {
        errors: [
          {
            field: "password",
            message: "incorrect password",
          },
        ],
      };
    }
    
    req.session.userId = user.id;
    // res.writeHead(200, {
    //   "Set-Cookie": "li=encryptedstring; HttpOnly",
    //   "Access-Control-Allow-Credentials": "true"
    // })
    // .send();
    return {
      user,
    };
  }

  @Mutation(() => Boolean)
  logout(@Ctx() { req, res }: MyContext) {
    return new Promise((resolve) =>
      req.session.destroy((err) => {
        res.clearCookie(COOKIE_NAME);
        if (err) {
          console.log(err);
          resolve(false);
          return;
        }

        resolve(true);
      })
    );
  }
}


