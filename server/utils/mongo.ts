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
		// MongoDB driver v5.x with simplified options for better TLS compatibility
		client = new MongoClient(uri, {
			serverSelectionTimeoutMS: 5000,
			connectTimeoutMS: 10000,
		});
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
