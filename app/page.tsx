'use client';
import React, { useState, useEffect } from 'react';
import { Plus, X, Check, Circle, Filter, Star, Zap, Wifi, WifiOff, Database, RefreshCw } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy, Firestore } from 'firebase/firestore';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBULBVFmOoauVUzp_FkFS0oIInm5OyBV7Q",
  authDomain: "to-do-9c859.firebaseapp.com",
  projectId: "to-do-9c859",
  storageBucket: "to-do-9c859.firebasestorage.app",
  messagingSenderId: "3672376ss05937",
  appId: "1:367237605937:web:3e52770957359bfa94c310",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Define TypeScript interfaces
interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt?: Date;
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [db, setDb] = useState<Firestore | null>(null);
  const [firebaseError, setFirebaseError] = useState<string | null>(null);
  const [usingLocalStorage, setUsingLocalStorage] = useState(false);

  // Initialize Firebase
  useEffect(() => {
    const initializeFirebase = async () => {
      try {
        const firestoreDb = getFirestore(app);
        setDb(firestoreDb);
        setFirebaseError(null);

        // Fetch tasks from Firestore
        const q = query(collection(firestoreDb, 'tasks'), orderBy('createdAt', 'desc'));
        onSnapshot(q, (querySnapshot) => {
          const tasksArray: Task[] = [];
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            tasksArray.push({ 
              id: doc.id, 
              text: data.text,
              completed: data.completed,
              createdAt: data.createdAt?.toDate()
            });
          });
          setTasks(tasksArray);
          setLoading(false);
        }, (error) => {
          console.error("Firestore error:", error);
          setFirebaseError(error.message);
          setLoading(false);
          fallbackToLocalStorage();
        });
        
      } catch (error) {
        console.error("Error initializing Firebase:", error);
        setFirebaseError((error as Error).message);
        setLoading(false);
        fallbackToLocalStorage();
      }
    };

    const fallbackToLocalStorage = () => {
      const localTasks = localStorage.getItem('tasks');
      if (localTasks) {
        setTasks(JSON.parse(localTasks));
      }
      setUsingLocalStorage(true);
    };

    initializeFirebase();
  }, []);

  const addTask = async () => {
    if (newTask.trim()) {
      try {
        if (db && !firebaseError) {
          // Add to Firebase
          await addDoc(collection(db, 'tasks'), {
            text: newTask,
            completed: false,
            createdAt: new Date()
          });
        } else {
          // Fallback to local storage
          const newTaskObj: Task = {
            id: Date.now().toString(),
            text: newTask,
            completed: false
          };
          const updatedTasks = [...tasks, newTaskObj];
          setTasks(updatedTasks);
          localStorage.setItem('tasks', JSON.stringify(updatedTasks));
          setUsingLocalStorage(true);
        }
        setNewTask('');
      } catch (error) {
        console.error("Error adding task: ", error);
        alert(`Failed to add task: ${(error as Error).message}. Please make sure you&apos;ve created the Firestore database.`);
      }
    }
  };

  const toggleTask = async (id: string) => {
    try {
      if (db && !firebaseError) {
        // Update in Firebase
        const taskRef = doc(db, 'tasks', id);
        const task = tasks.find(t => t.id === id);
        if (task) {
          await updateDoc(taskRef, {
            completed: !task.completed
          });
        }
      } else {
        // Fallback to local storage
        const updatedTasks = tasks.map(task =>
          task.id === id ? { ...task, completed: !task.completed } : task
        );
        setTasks(updatedTasks);
        localStorage.setItem('tasks', JSON.stringify(updatedTasks));
        setUsingLocalStorage(true);
      }
    } catch (error) {
      console.error("Error updating task: ", error);
      alert(`Failed to update task: ${(error as Error).message}`);
    }
  };

  const deleteTask = async (id: string) => {
    try {
      if (db && !firebaseError) {
        // Delete from Firebase
        await deleteDoc(doc(db, 'tasks', id));
      } else {
        // Fallback to local storage
        const updatedTasks = tasks.filter(task => task.id !== id);
        setTasks(updatedTasks);
        localStorage.setItem('tasks', JSON.stringify(updatedTasks));
        setUsingLocalStorage(true);
      }
    } catch (error) {
      console.error("Error deleting task: ", error);
      alert(`Failed to delete task: ${(error as Error).message}`);
    }
  };

  const clearAllData = () => {
    if (window.confirm("Are you sure you want to clear all tasks?")) {
      setTasks([]);
      localStorage.removeItem('tasks');
      setUsingLocalStorage(true);
    }
  };

  const retryFirebaseConnection = () => {
    setLoading(true);
    setFirebaseError(null);
    window.location.reload();
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  const completedCount = tasks.filter(task => task.completed).length;
  const totalCount = tasks.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4 sm:p-6 lg:p-8">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-4 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-1/2 -right-4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute -bottom-8 left-1/3 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl shadow-lg transform rotate-12 hover:rotate-0 transition-transform duration-300">
              <Star className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              TaskFlow
            </h1>
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg transform -rotate-12 hover:rotate-0 transition-transform duration-300">
              <Zap className="w-8 h-8 text-white" />
            </div>
          </div>
          <p className="text-blue-200 text-lg font-medium">Organize your life, one task at a time</p>

          {/* Connection Status */}
          <div className="mt-4 flex justify-center items-center gap-2">
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${db && !firebaseError ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
              {db && !firebaseError ? (
                <>
                  <Wifi className="w-4 h-4" />
                  <span className="text-sm">Connected to Firebase</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4" />
                  <span className="text-sm">Using Local Storage</span>
                </>
              )}
            </div>
            
            {firebaseError && (
              <button 
                onClick={retryFirebaseConnection}
                className="flex items-center gap-1 text-sm text-blue-300 hover:text-blue-200 underline"
              >
                <RefreshCw className="w-4 h-4" />
                Retry Connection
              </button>
            )}
          </div>

          {/* Firebase Setup Instructions */}
          {firebaseError && firebaseError.includes('Missing or insufficient permissions') && (
            <div className="mt-4 p-3 bg-red-500/20 border border-red-400/30 rounded-lg text-red-300 text-sm">
              <p className="font-medium">Firestore Database Not Set Up</p>
              <p>1. Go to Firebase Console → Firestore Database</p>
              <p>2. Click &quot;Create Database&quot;</p>
              <p>3. Start in test mode</p>
              <p>4. Set security rules to allow read/write access</p>
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center justify-center gap-6 mt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{totalCount}</div>
              <div className="text-blue-300 text-sm">Total</div>
            </div>
            <div className="w-px h-8 bg-blue-400 opacity-50"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{completedCount}</div>
              <div className="text-blue-300 text-sm">Done</div>
            </div>
            <div className="w-px h-8 bg-blue-400 opacity-50"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">{totalCount - completedCount}</div>
              <div className="text-blue-300 text-sm">Left</div>
            </div>
          </div>
        </div>

        {/* Main Container */}
        <div className="w-full max-w-lg lg:max-w-2xl">
          <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-6 sm:p-8">
            {/* Add Task Section */}
            <div className="mb-8">
              <div className="flex gap-3 mb-6">
                <div className="flex-1 relative">
                  <input
                    className="w-full px-4 py-4 bg-white/20 border border-white/30 rounded-2xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm transition-all duration-300 text-lg"
                    type="text"
                    placeholder="What needs to be done?"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTask()}
                    disabled={loading}
                  />
                </div>
                <button
                  onClick={addTask}
                  disabled={loading}
                  className="px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
                  )}
                </button>
              </div>

              {/* Filter Buttons */}
              <div className="flex justify-center gap-2">
                {[
                  { key: 'all', label: 'All', icon: Circle },
                  { key: 'active', label: 'Active', icon: Filter },
                  { key: 'completed', label: 'Done', icon: Check }
                ].map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setFilter(key)}
                    disabled={loading}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 text-sm font-medium ${filter === key
                        ? 'bg-white/30 text-white shadow-lg backdrop-blur-sm border border-white/40'
                        : 'text-blue-200 hover:bg-white/10 hover:text-white'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tasks List */}
            <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
              {loading ? (
                <div className="text-center py-12">
                  <div className="w-24 h-24 mx-auto mb-4 bg-white/10 rounded-full flex items-center justify-center">
                    <div className="w-12 h-12 border-4 border-blue-300 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <p className="text-blue-200 text-lg">Loading tasks...</p>
                </div>
              ) : filteredTasks.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-24 h-24 mx-auto mb-4 bg-white/10 rounded-full flex items-center justify-center">
                    <Check className="w-12 h-12 text-blue-300" />
                  </div>
                  <p className="text-blue-200 text-lg">No tasks found</p>
                  <p className="text-blue-300 text-sm mt-2">
                    {filter === 'all' ? 'Add a new task to get started!' :
                      filter === 'active' ? 'All tasks completed! 🎉' :
                        'No completed tasks yet'}
                  </p>
                </div>
              ) : (
                filteredTasks.map((task, index) => (
                  <div
                    key={task.id}
                    className={`group flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] ${task.completed
                        ? 'bg-green-500/20 border border-green-400/30'
                        : 'bg-white/10 border border-white/20 hover:bg-white/20'
                      }`}
                    style={{
                      animationDelay: `${index * 100}ms`,
                    }}
                  >
                    <button
                      onClick={() => toggleTask(task.id)}
                      disabled={loading}
                      className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${task.completed
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'border-blue-300 hover:border-blue-400 hover:bg-blue-400/20'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {task.completed && <Check className="w-4 h-4" />}
                    </button>

                    <span className={`flex-1 transition-all duration-300 ${task.completed
                        ? 'text-green-200 line-through opacity-75'
                        : 'text-white'
                      }`}>
                      {task.text}
                    </span>

                    <button
                      onClick={() => deleteTask(task.id)}
                      disabled={loading}
                      className="flex-shrink-0 w-8 h-8 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all duration-300 opacity-0 group-hover:opacity-100 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-blue-300 text-sm">
            {tasks.length > 0
              ? `Data ${db && !firebaseError ? 'synced with Firebase' : 'saved locally'} • ${tasks.length} task${tasks.length !== 1 ? 's' : ''}`
              : 'Add your first task to get started'}
          </p>
          
          {usingLocalStorage && (
            <div className="mt-4 flex flex-col items-center gap-2">
              <p className="text-yellow-400 text-sm flex items-center gap-1">
                <Database className="w-4 h-4" />
                <span>Using browser storage - data won&apos;t sync across devices</span>
              </p>
              <button 
                onClick={clearAllData}
                className="text-red-400 text-xs hover:text-red-300 underline"
              >
                Clear all tasks
              </button>
            </div>
          )}
          
          <p className="text-blue-400 text-xs mt-2">
            Stay productive, stay amazing ✨
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 3px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </div>
  );
}