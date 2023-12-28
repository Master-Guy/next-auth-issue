import SequelizeAdapter from '@auth/sequelize-adapter';
import NextAuth, { NextAuthOptions } from 'next-auth';
import EmailProvider from 'next-auth/providers/email';
import GoogleProvider from 'next-auth/providers/google';
import { Sequelize } from 'sequelize';


const MySQLhost = process.env.MySQLhost || 'localhost';
const MySQLport = parseInt(process.env.MySQLport || '3306');
const MySQLuser = process.env.MySQLuser || 'root';
const MySQLpassword = process.env.MySQLpass || '';
const MySQLdatabase = process.env.MySQLdatabase || process.env.MySQLuser || 'Navis';

const sequelize = new Sequelize(
	'mysql://' + MySQLuser + ':' + MySQLpassword + '@' + MySQLhost + ':' + MySQLport + '/' + MySQLdatabase,
	{
		dialect: 'mysql',
		dialectModule: require('mysql2')
	}
);

export const authOptions: NextAuthOptions = {
	providers: [
		EmailProvider({
			from: process.env.AUTH_FROM_EMAIL_ADDR,
			secret: process.env.AUTH_RANDOM_TOKEN,
			server: {
				host: process.env.AUTH_EMAILSERVER_HOST,
				port: process.env.AUTH_EMAILSERVER_PORT,
				auth: {
					user: process.env.AUTH_EMAILSERVER_USER,
					pass: process.env.AUTH_EMAILSERVER_PSWD
				}
			}
		}),
		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENTID || '',
			clientSecret: process.env.GOOGLE_SECRET || '',
			allowDangerousEmailAccountLinking: false
		}),
	],
	adapter: SequelizeAdapter(sequelize),
	callbacks: {
		jwt({ token, account, user }) {
			if (account) {
				token.accessToken = account.access_token;
				token.id = user?.id;
			}
			return token;
		},
		session({ session, user }) {
			session.user.id = user.id;
			return session;
		},
	}
};

export default NextAuth(authOptions);
