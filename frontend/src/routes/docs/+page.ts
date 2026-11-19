import {redirect} from '@sveltejs/kit';
import type {PageLoad} from './$types';

// Keep existing bookmarks and workspace links working after the public guide moves.
export const load:PageLoad=()=>redirect(307,'/about');
