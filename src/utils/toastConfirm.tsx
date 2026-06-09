import toast from 'react-hot-toast';

export const confirmAlert = (message: string): Promise<boolean> => {
  return new Promise((resolve) => {
    toast.custom(
      (t) => (
        <div className={`max-w-md w-full bg-white shadow-2xl rounded-2xl flex flex-col overflow-hidden border border-gray-200 transition-all duration-300 pointer-events-auto ${t.visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
          <div className="p-6 flex flex-col gap-3 text-center">
            <h3 className="text-gray-900 font-black text-xl">Confirm Action</h3>
            <p className="text-sm text-gray-600 font-medium leading-relaxed">
              {message}
            </p>
          </div>
          <div className="flex border-t border-gray-100 divide-x divide-gray-100 bg-gray-50">
            <button
              onClick={() => {
                toast.remove(t.id);
                resolve(false);
              }}
              className="w-full px-4 py-4 text-sm font-bold text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors focus:outline-none"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                toast.remove(t.id);
                resolve(true);
              }}
              className="w-full px-4 py-4 text-sm font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition-colors focus:outline-none"
            >
              Confirm
            </button>
          </div>
        </div>
      ),
      { duration: Infinity, position: 'top-center' }
    );
  });
};
