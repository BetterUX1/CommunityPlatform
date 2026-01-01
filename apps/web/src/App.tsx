import { useEffect, useState } from 'react';

type Notice = { id: number; title: string; body: string; createdAt: string };

export default function App() {
	//const API = import.meta.env.VITE_API_BASE_URL ?? '/api';
	const API = (import.meta.env.VITE_API_BASE_URL ?? '/api').replace(/\/$/, '');

	const [notices, setNotices] = useState<Notice[]>([]);
	const [title, setTitle] = useState('');
	const [body, setBody] = useState('');
	const [err, setErr] = useState<string | null>(null);

	async function load() {
		setErr(null);
		const r = await fetch(`${API}/notices`);
		if (!r.ok) throw new Error(`GET /notices failed: ${r.status}`);
		setNotices(await r.json());
	}

	useEffect(() => {
		load().catch(e => setErr(String(e)));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Create new notice
	async function submit(e: React.FormEvent) {
		e.preventDefault();
		setErr(null);

		const r = await fetch(`${API}/notices`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ title, body }),
		});

		if (!r.ok) {
			const txt = await r.text();
			throw new Error(`POST /notices failed: ${r.status} ${txt}`);
		}

		setTitle('');
		setBody('');
		await load();
	}

	async function remove(id: number) {
		setErr(null);

		const r = await fetch(`${API}/notices/${id}`, {
			method: 'DELETE',
		});
		if (!r.ok) {
			const txt = await r.text();
			throw new Error(`DELETE /notices/${id} failed: ${r.status} ${txt}`);
		}

		await load();
	}

	return (
		<div
			style={{ maxWidth: 900, margin: '40px auto', fontFamily: 'system-ui' }}
		>
			<h1>Samfälligheten</h1>

			<h2>Skapa anslag</h2>
			<form onSubmit={submit} style={{ marginBottom: 24 }}>
				<div style={{ marginBottom: 8 }}>
					<input
						value={title}
						onChange={e => setTitle(e.target.value)}
						placeholder='Titel'
						style={{ width: '100%', padding: 8 }}
					/>
				</div>
				<div style={{ marginBottom: 8 }}>
					<textarea
						value={body}
						onChange={e => setBody(e.target.value)}
						placeholder='Text'
						rows={4}
						style={{ width: '100%', padding: 8 }}
					/>
				</div>
				<button type='submit' disabled={!title || !body}>
					Spara
				</button>
			</form>

			{err && <p style={{ color: 'crimson' }}>Fel: {err}</p>}

			<h2>Nyheter / anslag</h2>
			<ul>
				{notices.map(n => (
					<li key={n.id} style={{ marginBottom: 16 }}>
						<strong>{n.title}</strong>
						<button onClick={() => remove(n.id).catch(e => setErr(String(e)))}>
							Ta bort
						</button>
						<div>{n.body}</div>
						<small>{new Date(n.createdAt).toLocaleString()}</small>
					</li>
				))}
			</ul>
		</div>
	);
}
