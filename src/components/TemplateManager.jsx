import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import {
  Star, Lightbulb, Zap, Plus, X, TrendingUp, Share2,
  AlertCircle, CheckCircle, Copy, Check
} from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// ============ PHASE 1: TEMPLATE SUGGESTIONS ============

export const TemplateSuggestions = ({ customerMessage, onApply }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [hint, setHint] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const fetchSuggestions = useCallback(async () => {
    if (!customerMessage.trim() || customerMessage.trim().length < 5) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${API}/templates/suggestions`,
        { customer_message: customerMessage, limit: 5 },
        { withCredentials: true }
      );
      const data = response.data;
      setSuggestions(data.suggestions || []);
      setHint(data.suggestion_hint || '');
      if (data.suggestions?.length > 0) {
        setShowSuggestions(true);
      } else {
        setShowSuggestions(false);
      }
    } catch (error) {
      // Silently fail - suggestions are optional
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setLoading(false);
    }
  }, [customerMessage]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (customerMessage.trim().length >= 5) {
        fetchSuggestions();
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [customerMessage, fetchSuggestions]);

  if (!showSuggestions || suggestions.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
            Suggested Templates ({suggestions.length})
          </span>
        </div>
        <button
          onClick={() => setShowSuggestions(false)}
          className="text-blue-400 hover:text-blue-600"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {hint && (
        <p className="text-xs text-blue-600 dark:text-blue-400 mb-2">{hint}</p>
      )}

      <div className="space-y-2">
        {suggestions.map((template) => (
          <div
            key={template.template_id}
            className="p-2 bg-white dark:bg-slate-800 rounded border border-blue-100 dark:border-slate-700 text-xs cursor-pointer hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
            onClick={() => onApply?.(template)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="font-medium text-slate-900 dark:text-slate-100">
                  {template.name}
                </p>
                <p className="text-slate-500 mt-0.5 line-clamp-1">
                  {template.customer_message}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                    template.tone === 'friendly' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400' :
                    template.tone === 'professional' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400' :
                    'bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400'
                  }`}>
                    {template.tone}
                  </span>
                  <span className="text-slate-400">Used {template.use_count || 0}x</span>
                  {template.avg_rating > 0 && (
                    <span className="text-yellow-500">★ {template.avg_rating.toFixed(1)}</span>
                  )}
                </div>
              </div>
              <span className="text-blue-500 text-[10px] font-medium ml-2 whitespace-nowrap">Use →</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============ PHASE 2: TEMPLATE RATING ============

export const TemplateRating = ({ templateId, onRate }) => {
  const [rating, setRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRate = async (ratingValue) => {
    setRating(ratingValue);
    setIsSubmitting(true);

    try {
      await axios.post(
        `${API}/templates/${templateId}/rate`,
        { rating: ratingValue },
        { withCredentials: true }
      );
      toast.success('Template rated!');
      onRate?.(ratingValue);
      
      // Reset after 2 seconds
      setTimeout(() => setRating(0), 2000);
    } catch (error) {
      console.error('Error rating template:', error);
      toast.error('Failed to rate template');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-slate-500">Rate:</span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => handleRate(star)}
            disabled={isSubmitting}
            className="transition-colors"
            title={`Rate ${star} star${star > 1 ? 's' : ''}`}
          >
            <Star
              className={`w-4 h-4 ${
                star <= rating
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300 hover:text-yellow-300'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
};

// ============ PHASE 3: TEMPLATE VARIANTS ============

export const TemplateVariants = ({ templateId, onSelectVariant }) => {
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showVariants, setShowVariants] = useState(false);
  const [newVariant, setNewVariant] = useState({ response: '', description: '' });
  const [isAdding, setIsAdding] = useState(false);
  const [variantCount, setVariantCount] = useState(0);

  // Fetch variant count on mount
  useEffect(() => {
    if (templateId) {
      axios.get(`${API}/templates/${templateId}/variants`, { withCredentials: true })
        .then(res => {
          const v = res.data.variants || [];
          setVariants(v);
          setVariantCount(v.length);
        })
        .catch(() => {});
    }
  }, [templateId]);

  useEffect(() => {
    if (showVariants && templateId) {
      fetchVariants();
    }
  }, [showVariants, templateId]);

  const fetchVariants = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${API}/templates/${templateId}/variants`,
        { withCredentials: true }
      );
      setVariants(response.data.variants || []);
    } catch (error) {
      console.error('Error fetching variants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddVariant = async () => {
    if (!newVariant.response.trim()) {
      toast.error('Please enter a response');
      return;
    }

    setIsAdding(true);
    try {
      const response = await axios.post(
        `${API}/templates/${templateId}/variants`,
        newVariant,
        { withCredentials: true }
      );
      const updated = [...variants, response.data.variant];
      setVariants(updated);
      setVariantCount(updated.length);
      setNewVariant({ response: '', description: '' });
      toast.success('Variant added!');
    } catch (error) {
      console.error('Error adding variant:', error);
      toast.error('Failed to add variant');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowVariants(!showVariants)}
        className="text-xs"
      >
        <Zap className="w-3 h-3 mr-1" />
        Variants ({variantCount})
      </Button>

      {showVariants && (
        <Dialog open={showVariants} onOpenChange={setShowVariants}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Template Variants</DialogTitle>
            </DialogHeader>

            <Tabs defaultValue="list" className="w-full">
              <TabsList>
                <TabsTrigger value="list">
                  View Variants ({variants.length})
                </TabsTrigger>
                <TabsTrigger value="add">Add New</TabsTrigger>
              </TabsList>

              <TabsContent value="list" className="space-y-3">
                {loading ? (
                  <p className="text-center text-slate-500">Loading variants...</p>
                ) : variants.length === 0 ? (
                  <p className="text-center text-slate-500">No variants yet</p>
                ) : (
                  <ScrollArea className="h-80 pr-4">
                    <div className="space-y-3">
                      {variants.map((variant) => (
                        <div
                          key={variant.variant_id}
                          className="p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800"
                        >
                          <p className="text-xs text-slate-500 mb-2">
                            {variant.description || 'No description'}
                          </p>
                          <p className="text-sm text-slate-900 dark:text-slate-100 whitespace-pre-wrap mb-2">
                            {variant.response}
                          </p>
                          <div className="flex items-center justify-between text-xs text-slate-500">
                            <span>Uses: {variant.usage_count || 0}</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                navigator.clipboard.writeText(variant.response);
                                toast.success('Copied!');
                                onSelectVariant?.(variant);
                              }}
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </TabsContent>

              <TabsContent value="add" className="space-y-3">
                <div>
                  <label className="text-xs font-medium">Variant Response</label>
                  <Textarea
                    value={newVariant.response}
                    onChange={(e) =>
                      setNewVariant({ ...newVariant, response: e.target.value })
                    }
                    placeholder="Enter the response variant..."
                    className="mt-2 font-mono text-xs"
                    rows={6}
                  />
                </div>

                <div>
                  <label className="text-xs font-medium">Description (optional)</label>
                  <Input
                    value={newVariant.description}
                    onChange={(e) =>
                      setNewVariant({ ...newVariant, description: e.target.value })
                    }
                    placeholder="e.g., 'More formal version'"
                    className="mt-2 text-xs"
                  />
                </div>

                <Button
                  onClick={handleAddVariant}
                  disabled={isAdding || !newVariant.response.trim()}
                  className="w-full"
                >
                  {isAdding ? 'Adding...' : 'Add Variant'}
                </Button>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowVariants(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

// ============ PHASE 3: TEAM TEMPLATE SHARING ============

export const TemplateSharing = ({ templateId, isTeamTemplate, onShare }) => {
  const [isSharing, setIsSharing] = useState(false);

  const handleShare = async () => {
    setIsSharing(true);
    try {
      await axios.post(
        `${API}/templates/${templateId}/share-team`,
        {},
        { withCredentials: true }
      );
      toast.success('Template shared with team!');
      onShare?.(true);
    } catch (error) {
      console.error('Error sharing template:', error);
      toast.error('Failed to share template');
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <Button
      variant={isTeamTemplate ? 'default' : 'outline'}
      size="sm"
      onClick={handleShare}
      disabled={isSharing || isTeamTemplate}
      className="text-xs"
    >
      <Share2 className="w-3 h-3 mr-1" />
      {isTeamTemplate ? 'Team Shared' : 'Share'}
    </Button>
  );
};

// ============ TEMPLATE CATEGORIES (PHASE 2) ============

export const TemplateCategories = () => {
  const [categories, setCategories] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        `${API}/templates/categories`,
        { withCredentials: true }
      );
      setCategories(response.data.categories || {});
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-slate-500">Loading categories...</p>;
  }

  const categoryList = Object.entries(categories);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
      {categoryList.map(([key, category]) => (
        <div
          key={key}
          className="p-3 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="font-medium text-sm text-slate-900 dark:text-slate-100">
                {category.name}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {category.description}
              </p>
              <p className="text-xs text-slate-400 mt-2 font-mono">
                {category.example_trigger}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
