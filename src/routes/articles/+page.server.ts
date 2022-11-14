import { Client } from '@notionhq/client';
import { Client as redis_Client } from 'redis-om';
import * as dotenv from 'dotenv';
import type { PageServerLoad } from './$types';
dotenv.config();

const redis_client = new redis_Client();

export const load: PageServerLoad = async () => {
	await getAllPosts();
};

const getSerializedJSON = async (databaseId: string) => {
	const notion_client = new Client({ auth: process.env.NOTION_KEY });
	const response = await notion_client.blocks.children.list({ block_id: databaseId });
	return JSON.stringify(response);
};

const getAllPosts = async () => {
	if (!redis_client.isOpen()) {
		await redis_client.open(process.env.REDIS_URL);
	}
	let result = await redis_client.execute(['HGETALL', 'notion-pages']);
	let all_ids = [];
	let all_posts = [];
	let all_slugs = [];
	//@ts-ignore
	for (let i = 0; i < result.length / 2; i++) {
			//@ts-ignore
			all_ids.push(result[i * 2 + 1]);
			//@ts-ignore
			all_slugs.push(result[i * 2]);
	}
	for (let i = 0; i < all_ids.length; i++) {
		let parsedJSON = JSON.parse(await getSerializedJSON(all_ids[i]));
		let title, info;
		for (let i = 0; i < parsedJSON.results.length; i++) {
			if (parsedJSON.results[i].type == 'heading_1' && title == null) {
				//@ts-ignore
				title = parsedJSON.results[i].heading_1.rich_text[0].plain_text;
				//@ts-ignore
			} else if (parsedJSON.results[i].type == 'to_do' && info == null) {
				//@ts-ignore
				info = parsedJSON.results[i].to_do.rich_text[0].plain_text;
				//@ts-ignore
			} 
		}
		all_posts.push({
			title: title,
			info: info,
			slug: all_slugs[i]
		});
	}
	await redis_client.close();
	return all_posts;
};