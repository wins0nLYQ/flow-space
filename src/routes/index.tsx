import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: Home,
});

function Home() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Welcome to FlowSpace</h2>
      <p className="text-gray-300 mb-6">
        Your dark-themed productivity workspace is ready!
      </p>

      <div className="bg-[#1f1f1f] rounded p-4 mb-4">
        <h3 className="text-lg font-semibold mb-2">Layout Specifications</h3>
        <ul className="text-sm text-gray-400 space-y-1">
          <li>✅ Header padding: 2px (0.5)</li>
          <li>✅ Main content background: #282828</li>
          <li>✅ Page background: #171717</li>
          <li>✅ Content border radius: 5px</li>
          <li>✅ Page padding: 5px</li>
          <li>✅ Dark theme fixed</li>
        </ul>
      </div>

      <div className="text-sm text-gray-500">
        Ready for your next component! Just tell me what you want to add.
      </div>
    </div>
  );
}
