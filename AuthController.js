import 'dotenv/config.js';
import qs from 'qs';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from "uuid"
import dayjs from 'dayjs';
import pg from 'pg';
import { fileURLToPath } from 'url';
import path from 'path';
const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pool = new Pool({
  user: process.env.POSTGRES,
  host: 'localhost',
  database: 'siscms_next',
  password: process.env.DBPASSWORD,
  port: 5432,
})

//Google Authorization URL to start OAuth flow.
export const getGoogleOAuthURL = () => {
  const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth"

  const options = {
    redirect_uri: process.env.GOOGLE_REDIRECT_URI,
    client_id: process.env.GOOGLE_CLIENT_ID,
    access_type: 'offline',
    response_type: 'code',
    prompt: 'consent',
    scope: ['https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/classroom.coursework.students',
      'https://www.googleapis.com/auth/classroom.courses',
      'https://www.googleapis.com/auth/classroom.rosters',
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/gmail.modify',
      'https://www.googleapis.com/auth/classroom.profile.emails',
      'https://www.googleapis.com/auth/classroom.guardianlinks.students'
    ].join(" ")
  }
  const qs = new URLSearchParams(options)
  return `${rootUrl}?${qs.toString()}`;
}

//Once after client has consented and redirected with access code, get Access and Refresh Tokens
export const getGoogleOAuthTokens = async ({ code }) => {
      const url = "https://oauth2.googleapis.com/token";
      const values = {
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        grant_type: "authorization_code",
      }

      try {
        const res = await axios.post(url, qs.stringify(values),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          }
        );
        return res.data
      }
      catch (error) {
        console.log(error, 'Failed to fetch Google Oauth Token')
      }
}

//returns user info given session number
export async function userInfoHandler(req, res) {
  const session_id = req.cookies.mhs_session_id
  if (session_id === undefined)
  { return res.redirect('./login') }

  const result = await pool.query("\
      SELECT user_email FROM sessions WHERE id =$1", [session_id])
  if (result.rows.length === 0)
  {return res.redirect('./login') }

  return res.send(JSON.stringify({ user_email: result.rows[0].user_email }))
}

export async function refreshAccessToken({ id, access_token, expires_at, refresh_token }) {
  if (expires_at * 1000 < Date.now()) {
    console.log("expired")
    try {
      const rtResponse = await fetch("https://oauth2.googleapis.com/token", {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: process.env.GOOGLE_CLIENT_ID,
          client_secret: process.env.GOOGLE_CLIENT_SECRET,
          grant_type: "refresh_token",
          refresh_token: refresh_token,
        }),
        method: "POST",
      })
      const refresh_update = await rtResponse.json()

      const dbUpdate = await pool.query("\
             UPDATE sessions SET access_token = $1, expires_at = $2 WHERE id = $3",
        [refresh_update.access_token,
          Math.floor(Date.now() / 1000 + refresh_update.expires_in), id]
       )
      //update access token with refreshed value.
      access_token = refresh_update.access_token;
    } catch (error) {
      console.error("Error refreshing access token", error)
    }
  }
  return access_token
}

export async function getToken(req,res) {
  const session_id = req.cookies.mhs_session_id

  const dbresult = await pool.query("\
       SELECT id,access_token,expires_at,refresh_token FROM sessions WHERE id =$1", [session_id])
  let {access_token, expires_at, refresh_token } = dbresult.rows[0]

  //Check if acces_token is expired
  if (expires_at * 1000 < Date.now()) {
    try {
      //Get new access token from Google
      const rtResponse = await fetch("https://oauth2.googleapis.com/token", {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: process.env.GOOGLE_CLIENT_ID,
          client_secret: process.env.GOOGLE_CLIENT_SECRET,
          grant_type: "refresh_token",
          refresh_token: refresh_token,
        }),
        method: "POST",
      })
      } catch (error) {
      console.error("Error refreshing access token", error)
      }
    const refresh_update = await rtResponse.json()
      //Update database with new access token and expiration
      const dbUpdate = await pool.query("\
             UPDATE sessions SET access_token = $1, expires_at = $2 WHERE id = $3",
        [refresh_update.access_token,
          Math.floor(Date.now() / 1000 + refresh_update.expires_in), session_id]
       )
      //update access token with refreshed value.
      access_token = refresh_update.access_token;
  }
  return access_token
}

async function upsertUser({email , name }) {
  const res = await pool.query(" \
  INSERT INTO users (id, email, name) \
    VALUES($1, $2, $3) \
    ON CONFLICT (email) \
    DO NOTHING \
    RETURNING email" , [uuidv4(), email, name])
  console.log(res)
}

async function createSession(session_id, googleAuthObj) {
  const res = await pool.query(" \
  INSERT INTO sessions (id, user_email, access_token, expires_at, refresh_token) \
    VALUES($1, $2, $3, $4, $5) \
    RETURNING user_email" , [session_id, jwt.decode(googleAuthObj.id_token).email,
    googleAuthObj.access_token,
    Math.floor(Date.now() / 1000 + googleAuthObj.expires_in),
    googleAuthObj.refresh_token])
  console.log(res)
}

export async function googleOauthHandler(req, res) {
  const code = req.query.code;
  const googleAuthObj = await getGoogleOAuthTokens({ code });
  const googleUser = jwt.decode(googleAuthObj.id_token)
  upsertUser(googleUser)
  const session_id = uuidv4();
  createSession(session_id, googleAuthObj)
  res.cookie("mhs_session_id", session_id,
    {
      httpOnly: true,
      expires: dayjs().add(7, "days").toDate(),
      secure: true
    })
  res.redirect("http://localhost:3000")
  return
}
