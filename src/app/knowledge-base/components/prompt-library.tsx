'use client';

import { Edit, Trash2, Zap } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { areSimilar } from '@/lib/utils/levenshtein';

import { PublishPromptDialog } from '../components/publish-prompt-dialog';

export function PromptLibrary() {
  const [isPublishOpen, setIsPublishOpen] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPrompts, setFilteredPrompts] = useState<any[]>([]);
  const [prompts, setPrompts] = useState([
    {
      id: '1',
      title: 'Customer Support Assistant',
      description: 'Handles common customer inquiries and provides helpful responses',
      agents: ['Support Bot'],
      updatedAt: '2 days ago',
    },
    {
      id: '2',
      title: 'Product Recommendation Engine',
      description: 'Suggests products based on customer preferences and browsing history',
      agents: ['Sales Assistant', 'Website Bot'],
      updatedAt: '1 week ago',
    },
    {
      id: '3',
      title: 'Technical Troubleshooting Guide',
      description: 'Walks users through common technical issues and solutions',
      agents: ['Support Bot'],
      updatedAt: '3 days ago',
    },
    {
      id: '4',
      title: 'Onboarding Sequence',
      description: 'Guides new users through product features and setup',
      agents: ['Website Bot'],
      updatedAt: '5 days ago',
    },
    {
      id: '5',
      title: 'Feature Announcement',
      description: 'Introduces users to new product features and updates',
      agents: [],
      updatedAt: '1 day ago',
    },
  ]);

  const handleDelete = (promptId: string) => {
    // Remove the prompt from the prompts array
    const updatedPrompts = prompts.filter(prompt => prompt.id !== promptId);
    setPrompts(updatedPrompts);
    
    // Also update filtered prompts to reflect the deletion
    setFilteredPrompts(prevFiltered => prevFiltered.filter(prompt => prompt.id !== promptId));
  };

  const handlePublish = (prompt: any) => {
    setSelectedPrompt(prompt);
    setIsPublishOpen(true);
  };

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredPrompts(prompts);

      return;
    }

    const filtered = prompts.filter(prompt => {
      const searchLower = searchQuery.toLowerCase();

      return (
        areSimilar(prompt.title, searchQuery) ||
        prompt.description.toLowerCase().includes(searchLower)
      );
    });

    setFilteredPrompts(filtered);
  }, [searchQuery]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  return (
    <div>
      <div className="p-4">
        <input
          type="search"
          placeholder="Search prompts..."
          className="w-full px-4 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </div>
      <div className="rounded-md">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="py-3 px-4 text-left font-medium">Prompt</th>
              <th className="py-3 px-4 text-left font-medium">Connected Agents</th>
              <th className="py-3 px-4 text-left font-medium">Last Updated</th>
              <th className="py-3 px-4 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPrompts.map((prompt, index) => (
              <tr key={prompt.id} className={index !== prompts.length - 1 ? 'border-b' : ''}>
                <td className="py-3 px-4">
                  <div>
                    <div className="font-medium">{prompt.title}</div>
                    <div className="text-sm text-muted-foreground">{prompt.description}</div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex flex-wrap gap-1">
                    {prompt.agents.length > 0 ? (
                      prompt.agents.map((agent) => (
                        <Badge key={agent} variant="secondary" className="flex items-center gap-1">
                          <Zap className="h-3 w-3" />
                          {agent}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">None</span>
                    )}
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-muted-foreground">{prompt.updatedAt}</td>
                <td className="py-3 px-4 text-right">
                  <div className="flex justify-end gap-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handlePublish(prompt)}
                      className="h-9 w-9 rounded-full bg-purple-50 hover:bg-purple-100 shadow-sm hover:shadow transition-all duration-200"
                    >
                      <Zap className="h-4 w-4 text-purple-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      asChild
                      className="h-9 w-9 rounded-full bg-blue-50 hover:bg-blue-100 shadow-sm hover:shadow transition-all duration-200"
                    >
                      <Link href={`/--legacy-peer-deps/editor/${prompt.id}`}>
                        <Edit className="h-4 w-4 text-blue-600" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(prompt.id)}
                      className="h-9 w-9 rounded-full bg-red-50 hover:bg-red-100 shadow-sm hover:shadow transition-all duration-200"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedPrompt && (
        <PublishPromptDialog open={isPublishOpen} onOpenChange={setIsPublishOpen} promptTitle={selectedPrompt.title} />
      )}
    </div>
  );
}
