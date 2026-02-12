const Terms = () => (
  <div className="min-h-screen bg-canvas p-12 text-text-main">
    <div className="mx-auto max-w-3xl rounded-3xl bg-white p-12 shadow-xl">
      <h1 className="mb-8 text-4xl font-bold">Terms of Service</h1>
      <p className="mb-4 text-slate-600">Last updated: {new Date().toLocaleDateString()}</p>
      <div className="prose prose-slate">
        <p>Welcome to Playbook Lite. By using our service, you agree to these terms.</p>
        <h3>1. Usage</h3>
        <p>Playbook Lite is intended for educational purposes for children. Parental guidance is required.</p>
        <h3>2. Subscription</h3>
        <p>After the initial trial, a paid license is required to continue access.</p>
        <h3>3. Disclaimer</h3>
        <p>This app is not a substitute for professional speech therapy.</p>
      </div>
      <a href="/" className="mt-8 block text-brand hover:underline">Return Home</a>
    </div>
  </div>
);

export default Terms;
