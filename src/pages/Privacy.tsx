const Privacy = () => (
  <div className="min-h-screen bg-canvas p-12 text-text-main">
    <div className="mx-auto max-w-3xl rounded-3xl bg-white p-12 shadow-xl">
      <h1 className="mb-8 text-4xl font-bold">Privacy Policy</h1>
      <p className="mb-4 text-slate-600">Last updated: {new Date().toLocaleDateString()}</p>
      <div className="prose prose-slate">
        <p>At Playbook Lite, we prioritize your child's privacy above all else.</p>
        <h3>1. Data Collection</h3>
        <p>We only collect the parent's mobile number for authentication. No voice data leaves your device unless explicitly stated for analysis (future feature).</p>
        <h3>2. Local Storage</h3>
        <p>Progress data is stored locally on your device.</p>
        <h3>3. Contact</h3>
        <p>For questions, contact us via WhatsApp.</p>
      </div>
      <a href="/" className="mt-8 block text-brand hover:underline">Return Home</a>
    </div>
  </div>
);

export default Privacy;
