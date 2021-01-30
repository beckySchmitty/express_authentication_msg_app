/** User class for message.ly */

const db = require("../db");
const bcrypt = require("bcrypt");
const ExpressError = require("../expressError");

const { BCRYPT_WORK_FACTOR } = require("../config");

/** User of the site. */
class User {

  /** register new user -- returns
   *    {username, password, first_name, last_name, phone}
   */
  static async register({username, password, first_name, last_name, phone}) { 
    let hashedPwd = await bcrypt.hash(password, BCRYPT_WORK_FACTOR)
    const results = await db.query(`INSERT INTO users
    (username, password, first_name, last_name, phone, join_at, last_login_at)
    VALUES ($1, $2, $3, $4, $5, current_timestamp, current_timestamp) 
    RETURNING username, password, first_name, last_name, phone`
    , [username, hashedPwd, first_name, last_name, phone]);

    return results.rows[0];
  }

  /** Authenticate: is this username/password valid? Returns boolean. */
  static async authenticate(username, password) { 
    const results = await db.query(`SELECT * FROM user WHERE username=$1`, [username]);
    const user = results.rows[0];

    if (!user) {
      throw new ExpressError(`User with username ${username} not found`, 401);
    }
    // returns true if passwords match
    return user && await bcrypt.compare(password, user.password);
  }

  /** Update last_login_at for user */
  static async updateLoginTimestamp(username) {
    const results = await db.query(`UPDATE users
    SET last_login = current_timestamp 
    WHERE username=$1
    RETURNING username`, [username]);

    if (!results.rows[0]) {
      throw new ExpressError(`User with username ${username} not found`, 404)
    }

   }

  /** All: basic info on all users:
   * [{username, first_name, last_name, phone}, ...] */
  static async all() { 
    const results = await db.query(`SELECT username, first_name, last_name, phone, 
    FROM users
    ORDER BY username`)
    return results.rows;
  }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */
  static async get(username) {
    const results = await db.query(`SELECT username, first_name, last_name, phone, join_at, last_login_at
    FROM users
    WHERE username=$1`, [username])
    const user = results.rows[0];

    if (!user) {
      throw new ExpressError(`User with username ${username} not found`, 404)
    }
    return user;
   }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */
  static async messagesFrom(username) {
    const result = await db.query(
      `SELECT m.id,
              m.to_username,
              u.first_name,
              u.last_name,
              u.phone,
              m.body,
              m.sent_at,
              m.read_at
        FROM messages AS m
        JOIN users AS u ON m.to_username = u.username
        WHERE u.username = $1`,
      [username]);

  return result.rows.map(m => ({
    id: m.id,
    to_user: {
      username: m.to_username,
      first_name: u.first_name,
      last_name: u.last_name,
      phone: u.phone,
    },
    body: m.body,
    sent_at: m.sent_at,
    read_at: m.read_at,
  }));

}

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {id, first_name, last_name, phone}
   */
  static async messagesTo(username) {
    const result = await db.query(
      `SELECT m.id,
              m.from_username,
              u.first_name,
              u.last_name,
              u.phone,
              m.body,
              m.sent_at,
              m.read_at
        FROM messages AS m
         JOIN users AS u ON m.from_username = u.username
        WHERE to_username = $1`,
      [username]);

  return result.rows.map(m => ({
    id: m.id,
    from_user: {
      username: m.from_username,
      first_name: m.first_name,
      last_name: m.last_name,
      phone: m.phone,
    },
    body: m.body,
    sent_at: m.sent_at,
    read_at: m.read_at
  }));
 }
}


module.exports = User;