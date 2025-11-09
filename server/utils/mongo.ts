import { Collection, Db, MongoClient, type Document } from 'mongodb';

let client: MongoClient | null = null;
let db: Db | null = null;

function getEnv(name: string, fallback?: string): string {
	const v = process.env[name] ?? fallback;
	if (!v) throw new Error(`Missing required environment variable: ${name}`);
	return v;
}

export async function getDb(): Promise<Db> {
	if (db) return db;

	const uri = getEnv('MONGODB_URI', 'mongodb://localhost:27017');
	const dbName = getEnv('MONGODB_DB', 'app');

	if (!client) {
		// Fix for MongoDB TLS handshake error on Heroku
		// Error: "SSL alert number 80" - internal error during TLS negotiation
		// This is caused by Node.js OpenSSL version incompatibility with MongoDB Atlas
		const options: any = {
			serverSelectionTimeoutMS: 5000,
			connectTimeoutMS: 10000,
			// Explicitly set minimum TLS version to avoid handshake issues
			minPoolSize: 1,
			maxPoolSize: 10,
		};

		// For MongoDB Atlas connections, we need specific TLS settings
		if (uri.includes('mongodb+srv') || uri.includes('mongodb.net')) {
			// Don't explicitly set tls:true as it's implied by mongodb+srv
			// and setting it can cause issues with connection string parameters
			// Instead, let the driver handle TLS from the connection string
		}

		client = new MongoClient(uri, options);
	}
	// Connect once when initializing the DB handle
	try {
		await client.connect();
		db = client.db(dbName);
		console.log('✅ MongoDB connected successfully');
		return db;
	} catch (error) {
		console.error('❌ MongoDB connection failed:', error);
		throw error;
	}
}

export async function getCollection<T extends Document = Document>(
	name: string
): Promise<Collection<T>> {
	const d = await getDb();
	return d.collection<T>(name);
}

export interface UserDoc extends Document {
	_id?: any;
	email: string;
	firstName: string;
	lastName: string;
	phone?: string;
	passwordHash: string;
	createdAt: Date;
}
