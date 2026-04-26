import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from './ui/button';
import { Loader2, MessageSquare, MessageCircle, Settings, ChevronRight, Mail, Check, X, Inbox, Bot, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';

import { Header } from './dashboard/Header';
import { BusinessProfileCard } from './dashboard/BusinessProfileCard';
import { ConversationList } from './dashboard/ConversationList';
import { RecentMessages } from './dashboard/RecentMessages';
import { ConversationPanel } from './dashboard/ConversationPanel';
import { CustomerMessageInput } from './dashboard/CustomerMessageInput';
import { TemplatesPanel } from './dashboard/TemplatesPanel';
import { AIResponseCard } from './dashboard/AIResponseCard';
import { SaveTemplateDialog } from './dashboard/SaveTemplateDialog';
import { AnalyticsDialog } from './dashboard/AnalyticsDialog';
import { CoachingDialog } from './dashboard/CoachingDialog';
import { TeamDialog } from './dashboard/TeamDialog';
import { WebhooksDialog } from './dashboard/WebhooksDialog';
import { BillingDialog } from './dashboard/BillingDialog';
import { ChannelsDialog } from './dashboard/ChannelsDialog';
import { InboxPanel } from './dashboard/InboxPanel';
import { AIAgentPanel } from './dashboard/AIAgentPanel';
import AnalyticsPanel from './dashboard/AnalyticsPanel';
import { ConfirmDialog } from './dashboard/ConfirmDialog';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const Dashboard = () => {
  const { user, authType, logout, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark';
    }
    return false;
  });
  
  // State
  const [customerMessage, setCustomerMessage] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [userInstruction, setUserInstruction] = useState('');
  const [tone, setTone] = useState('friendly');
  const [aiResponse, setAiResponse] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [messages, setMessages] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [activeProfile, setActiveProfile] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    business_name: '',
    business_info: '',
    default_tone: 'friendly',
    contact_info: '',
    response_signature: ''
  });
  const [activeTab, setActiveTab] = useState('generate');
  
  // Conversation state
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [conversationMessages, setConversationMessages] = useState([]);
  const [editingConvName, setEditingConvName] = useState(null);
  const [newConvName, setNewConvName] = useState('');
  
  // Templates state
  const [templates, setTemplates] = useState([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [saveTemplateDialog, setSaveTemplateDialog] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateCategory, setTemplateCategory] = useState('general');
  const [templateMode, setTemplateMode] = useState('exact');
  const [threadInstructions, setThreadInstructions] = useState('');
  const [messageToSave, setMessageToSave] = useState(null);
  const [activeTemplateContext, setActiveTemplateContext] = useState(null);
  const [suppressTemplateSuggestions, setSuppressTemplateSuggestions] = useState(true);

  const activeThreadTemplate = activeConversation?.thread_template_id
    ? {
        id: activeConversation.thread_template_id,
        name: activeConversation.thread_template_name,
        mode: activeConversation.thread_template_mode,
        instructions: activeConversation.thread_template_instructions || '',
      }
    : null;
  
  // Analytics state
  const [analytics, setAnalytics] = useState(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  
  // Coaching state
  const [coaching, setCoaching] = useState(null);
  const [showCoaching, setShowCoaching] = useState(false);
  const [isLoadingCoaching, setIsLoadingCoaching] = useState(false);
  
  // Team state
  const [showTeam, setShowTeam] = useState(false);
  const [team, setTeam] = useState(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [pendingInvitations, setPendingInvitations] = useState([]);
  
  // Billing state
  const [showBilling, setShowBilling] = useState(false);
  const [subscription, setSubscription] = useState(null);

  // Webhook state
  const [showWebhooks, setShowWebhooks] = useState(false);
  const [webhooks, setWebhooks] = useState([]);
  const [newWebhook, setNewWebhook] = useState({ name: '', url: '', events: [] });
  const [isCreatingWebhook, setIsCreatingWebhook] = useState(false);
  
  // Channel / Inbox state
  const [showChannels, setShowChannels] = useState(false);
  const [channels, setChannels] = useState([]);
  const [inboxMessages, setInboxMessages] = useState([]);
  const [unreadTotal, setUnreadTotal] = useState(0);
  const [unreadByChannel, setUnreadByChannel] = useState({});
  const [channelFilter, setChannelFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  
  // Rating state
  const [currentMessageId, setCurrentMessageId] = useState(null);
  const [currentRating, setCurrentRating] = useState(0);
  
  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    message: '',
    onConfirm: null,
    isLoading: false
  });
  
  // Chat history ref for auto-scroll
  const chatEndRef = useRef(null);
  const [chatExpanded, setChatExpanded] = useState(true);
  
  // Search state
  const [chatSearch, setChatSearch] = useState('');
  const [showChatSearch, setShowChatSearch] = useState(false);

  // Toggle dark mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatEndRef.current && conversationMessages.length > 0) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversationMessages]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/');
    }
  }, [authLoading, isAuthenticated, navigate]);

  // --- Fetch Functions ---

  const fetchProfiles = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/profiles`, { withCredentials: true });
      setProfiles(response.data.profiles || []);
      
      const active = response.data.profiles?.find(p => p.is_active) || response.data.profiles?.[0];
      if (active) {
        setActiveProfile(active);
        setProfileForm({
          business_name: active.business_name || '',
          business_info: active.business_info || '',
          default_tone: active.default_tone || 'friendly',
          contact_info: active.contact_info || '',
          response_signature: active.response_signature || ''
        });
        setTone(active.default_tone || 'friendly');
      }
    } catch (error) {
      console.error('Error fetching profiles:', error);
    }
  }, []);

  const fetchMessages = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/messages?limit=50`, { withCredentials: true });
      setMessages(response.data.messages || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }, []);

  const fetchConversations = useCallback(async (profileId) => {
    try {
      const url = profileId 
        ? `${API}/conversations?profile_id=${profileId}&limit=50`
        : `${API}/conversations?limit=50`;
      const response = await axios.get(url, { withCredentials: true });
      setConversations(response.data.conversations || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  }, []);

  const fetchTemplates = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/templates`, { withCredentials: true });
      setTemplates(response.data.templates || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  }, []);

  const fetchAnalytics = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/analytics/ratings`, { withCredentials: true });
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  }, []);

  const fetchCoaching = useCallback(async () => {
    setIsLoadingCoaching(true);
    try {
      const response = await axios.get(`${API}/coaching/suggestions`, { withCredentials: true });
      setCoaching(response.data);
    } catch (error) {
      console.error('Error fetching coaching:', error);
      toast.error('Failed to load coaching suggestions');
    } finally {
      setIsLoadingCoaching(false);
    }
  }, []);

  const fetchWebhooks = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/webhooks`, { withCredentials: true });
      setWebhooks(response.data.webhooks || []);
    } catch (error) {
      console.error('Error fetching webhooks:', error);
    }
  }, []);

  const fetchSubscription = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/billing/subscription`, { withCredentials: true });
      setSubscription(response.data);
    } catch (error) {
      console.error('Error fetching subscription:', error);
    }
  }, []);

  const fetchChannels = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/channels`, { withCredentials: true });
      setChannels(response.data.channels || []);
    } catch (error) {
      if (error.response?.status !== 403) {
        console.error('Error fetching channels:', error);
      }
    }
  }, []);

  const fetchInbox = useCallback(async (chFilter, stFilter) => {
    try {
      const params = new URLSearchParams();
      if (chFilter) params.set('channel_type', chFilter);
      if (stFilter) params.set('status', stFilter);
      const response = await axios.get(`${API}/inbox?${params.toString()}`, { withCredentials: true });
      setInboxMessages(response.data.messages || []);
      setUnreadTotal(response.data.unread_total || 0);
      setUnreadByChannel(response.data.unread_by_channel || {});
    } catch (error) {
      if (error.response?.status !== 403) {
        console.error('Error fetching inbox:', error);
      }
    }
  }, []);

  const fetchTeam = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/team/members`, { withCredentials: true });
      setTeam(response.data);
    } catch (error) {
      if (error.response?.status !== 403) {
        console.error('Error fetching team:', error);
      }
    }
  }, []);

  const fetchPendingInvitations = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/team/invitations/pending`, { withCredentials: true });
      setPendingInvitations(response.data.invitations || []);
    } catch (error) {
      if (error.response?.status !== 403) {
        console.error('Error fetching invitations:', error);
      }
    }
  }, []);

  const acceptInvitation = async (invitationId) => {
    try {
      await axios.post(`${API}/team/invitations/${invitationId}/accept`, {}, { withCredentials: true });
      toast.success('Invitation accepted! You are now a team member.');
      fetchPendingInvitations();
      fetchTeam();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to accept invitation');
    }
  };

  const declineInvitation = async (invitationId) => {
    try {
      await axios.post(`${API}/team/invitations/${invitationId}/decline`, {}, { withCredentials: true });
      toast.success('Invitation declined');
      fetchPendingInvitations();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to decline invitation');
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchProfiles();
      fetchMessages();
      fetchConversations();
      fetchTemplates();
      if (authType === 'user') {
        fetchTeam();
        fetchWebhooks();
        fetchPendingInvitations();
        fetchSubscription();
        fetchChannels();
        fetchInbox(null, null);
      }
    }
  }, [isAuthenticated, authType, fetchProfiles, fetchMessages, fetchConversations, fetchTemplates, fetchTeam, fetchWebhooks, fetchPendingInvitations, fetchSubscription, fetchChannels, fetchInbox]);

  // Poll for new inbox messages every 15 seconds to update notification badges
  useEffect(() => {
    if (!isAuthenticated || authType !== 'user') return;
    const interval = setInterval(() => {
      fetchInbox(channelFilter, statusFilter);
    }, 15000);
    return () => clearInterval(interval);
  }, [isAuthenticated, authType, channelFilter, statusFilter, fetchInbox]);

  // Handle billing return
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('billing') === 'success') {
      toast.success('Subscription activated! Welcome to your new plan.');
      fetchSubscription();
      window.history.replaceState({}, '', window.location.pathname);
    } else if (params.get('billing') === 'cancelled') {
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [fetchSubscription]);

  // Reload conversations when active profile changes
  useEffect(() => {
    if (activeProfile?.profile_id) {
      fetchConversations(activeProfile.profile_id);
    }
  }, [activeProfile?.profile_id, fetchConversations]);

  // --- Handler Functions ---

  const saveProfile = async () => {
    if (!profileForm.business_name?.trim()) {
      toast.error('Business name is required');
      return;
    }
    if (!profileForm.business_info?.trim()) {
      toast.error('Business info is required');
      return;
    }

    try {
      if (isCreatingProfile || !activeProfile) {
        const response = await axios.post(`${API}/profiles`, profileForm, { withCredentials: true });
        setProfiles([response.data.profile, ...profiles]);
        setActiveProfile(response.data.profile);
        setIsCreatingProfile(false);
        toast.success('Profile created successfully');
      } else {
        const response = await axios.patch(`${API}/profiles/${activeProfile.profile_id}`, profileForm, { withCredentials: true });
        setProfiles(profiles.map(p => p.profile_id === activeProfile.profile_id ? response.data.profile : p));
        setActiveProfile(response.data.profile);
        toast.success('Profile updated successfully');
      }
      setIsEditingProfile(false);
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error(error.response?.data?.detail || 'Failed to save profile');
    }
  };

  const switchProfile = async (profile) => {
    try {
      await axios.post(`${API}/profiles/${profile.profile_id}/activate`, {}, { withCredentials: true });
      setActiveProfile(profile);
      setProfileForm({
        business_name: profile.business_name || '',
        business_info: profile.business_info || '',
        default_tone: profile.default_tone || 'friendly',
        contact_info: profile.contact_info || '',
        response_signature: profile.response_signature || ''
      });
      setTone(profile.default_tone || 'friendly');
      fetchMessages();
      fetchConversations(profile.profile_id);
      toast.success(`Switched to ${profile.business_name}`);
    } catch (error) {
      toast.error('Failed to switch profile');
    }
  };

  const deleteProfile = async (profileId) => {
    const profileToDelete = profiles.find(p => p.profile_id === profileId);
    setConfirmDialog({
      open: true,
      title: 'Delete Profile',
      message: `Are you sure you want to delete "${profileToDelete?.business_name || 'this profile'}"? This action cannot be undone.`,
      isLoading: false,
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isLoading: true }));
        try {
          await axios.delete(`${API}/profiles/${profileId}`, { withCredentials: true });
          setProfiles(profiles.filter(p => p.profile_id !== profileId));
          if (activeProfile?.profile_id === profileId) {
            const remaining = profiles.filter(p => p.profile_id !== profileId);
            setActiveProfile(remaining[0] || null);
          }
          toast.success('Profile deleted');
          setConfirmDialog({ ...confirmDialog, open: false });
        } catch (error) {
          toast.error(error.response?.data?.detail || 'Failed to delete profile');
          setConfirmDialog(prev => ({ ...prev, isLoading: false }));
        }
      }
    });
  };

  const generateResponse = async () => {
    if (!customerMessage.trim()) {
      toast.error('Please enter a customer message');
      return;
    }
    if (!activeProfile) {
      toast.error('Please create or select a business profile first');
      return;
    }

    setIsGenerating(true);
    setAiResponse('');
    setCurrentRating(0);

    try {
      const response = await axios.post(`${API}/generate`, {
        customer_message: customerMessage,
        customer_name: customerName || undefined,
        tone: tone,
        conversation_id: activeConversation?.conversation_id,
        profile_id: activeProfile?.profile_id,
        business_name: activeProfile?.business_name,
        business_info: activeProfile?.business_info,
        template_mode: activeTemplateContext?.mode || activeConversation?.thread_template_mode,
        template_ai_response: activeTemplateContext?.ai_response || activeConversation?.thread_template_ai_response,
        template_guidelines: activeTemplateContext?.guidelines || activeConversation?.thread_template_guidelines,
        template_name: activeTemplateContext?.name || activeConversation?.thread_template_name,
        user_instruction: userInstruction || undefined
      }, { withCredentials: true });

      setAiResponse(response.data.response);
      setCurrentMessageId(response.data.message_id);
      
      if (response.data.conversation_id) {
        const convId = response.data.conversation_id;
        if (!activeConversation) {
          setActiveConversation({ conversation_id: convId, customer_name: customerName || 'Customer' });
        }
        
        const newMsg = {
          message_id: response.data.message_id,
          customer_message: customerMessage,
          ai_response: response.data.response,
          tone: tone,
          customer_name: customerName,
          created_at: new Date().toISOString()
        };
        setConversationMessages(prev => [...prev, newMsg]);
      }
      
      setCustomerMessage('');
      setUserInstruction('');
      setActiveTemplateContext(null);
      fetchMessages();
      fetchConversations();
    } catch (error) {
      console.error('Error generating response:', error);
      if (error.response?.status === 429) {
        toast.error(error.response?.data?.detail || 'Monthly AI handling limit reached.', {
          action: { label: 'Billing', onClick: () => { setShowBilling(true); fetchSubscription(); } }
        });
      } else {
        toast.error(error.response?.data?.detail || 'Failed to generate response');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const rateResponse = async (rating) => {
    if (!currentMessageId) return;
    try {
      await axios.post(`${API}/messages/${currentMessageId}/rate`, { rating }, { withCredentials: true });
      setCurrentRating(rating);
      toast.success('Thanks for your feedback!');
    } catch (error) {
      toast.error('Failed to save rating');
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(aiResponse);
      setCopied(true);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy');
    }
  };

  const deleteMessage = async (messageId) => {
    try {
      await axios.delete(`${API}/messages/${messageId}`, { withCredentials: true });
      setMessages(messages.filter(m => m.message_id !== messageId));
      toast.success('Message deleted');
    } catch (error) {
      toast.error('Failed to delete message');
    }
  };

  const loadFromHistory = (message) => {
    setCustomerMessage(message.customer_message);
    setCustomerName(message.customer_name || '');
    setTone(message.tone);
    setAiResponse(message.ai_response);
    setCurrentMessageId(message.message_id);
    setCurrentRating(message.rating || 0);
    if (message.conversation_id) {
      loadConversation({ conversation_id: message.conversation_id, customer_name: message.customer_name });
    }
    setActiveTab('generate');
  };

  const startNewConversation = () => {
    setActiveConversation(null);
    setConversationMessages([]);
    setCustomerMessage('');
    setCustomerName('');
    setAiResponse('');
    setActiveTemplateContext(null);
    setCurrentMessageId(null);
    setCurrentRating(0);
    setChatSearch('');
    setShowChatSearch(false);
    setSuppressTemplateSuggestions(true);
  };

  const loadConversation = async (conversation) => {
    setActiveConversation(conversation);
    setCustomerName(conversation.customer_name || '');
    setSuppressTemplateSuggestions(true);
    setChatExpanded(true);
    setChatSearch('');
    setShowChatSearch(false);
    try {
      const response = await axios.get(`${API}/conversations/${conversation.conversation_id}`, { withCredentials: true });
      setConversationMessages(response.data.messages || []);
      setActiveConversation(response.data.conversation);
      setCustomerMessage('');
      setActiveTemplateContext(null);
      setAiResponse('');
      setCurrentMessageId(null);
      setCurrentRating(0);
      const lastMsg = response.data.messages?.[response.data.messages.length - 1];
      if (lastMsg) {
        setTone(lastMsg.tone);
      }
    } catch (error) {
      toast.error('Failed to load conversation');
    }
    setActiveTab('generate');
  };

  const updateConversationName = async (conversationId, newName) => {
    if (!newName.trim()) {
      toast.error('Name cannot be empty');
      return;
    }
    if (newName.trim().length > 100) {
      toast.error('Name must be less than 100 characters');
      return;
    }
    try {
      await axios.patch(`${API}/conversations/${conversationId}`, {
        customer_name: newName.trim()
      }, { withCredentials: true });
      setConversations(conversations.map(c => 
        c.conversation_id === conversationId ? { ...c, customer_name: newName.trim() } : c
      ));
      if (activeConversation?.conversation_id === conversationId) {
        setActiveConversation({ ...activeConversation, customer_name: newName.trim() });
        setCustomerName(newName.trim());
      }
      setEditingConvName(null);
      setNewConvName('');
      toast.success('Conversation renamed');
    } catch (error) {
      console.error('Error updating conversation:', error);
      toast.error(error.response?.data?.detail || 'Failed to rename conversation');
    }
  };

  const deleteConversation = async (conversationId) => {
    const convToDelete = conversations.find(c => c.conversation_id === conversationId);
    setConfirmDialog({
      open: true,
      title: 'Delete Conversation',
      message: `Delete conversation with "${convToDelete?.customer_name || 'Customer'}"? This will permanently remove all messages.`,
      isLoading: false,
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isLoading: true }));
        try {
          await axios.delete(`${API}/conversations/${conversationId}`, { withCredentials: true });
          setConversations(conversations.filter(c => c.conversation_id !== conversationId));
          if (activeConversation?.conversation_id === conversationId) {
            startNewConversation();
          }
          toast.success('Conversation deleted');
          setConfirmDialog({ ...confirmDialog, open: false });
        } catch (error) {
          toast.error(error.response?.data?.detail || 'Failed to delete conversation');
          setConfirmDialog(prev => ({ ...prev, isLoading: false }));
        }
      }
    });
  };

  const togglePinMessage = async (messageId) => {
    try {
      const response = await axios.post(`${API}/messages/${messageId}/pin`, {}, { withCredentials: true });
      setConversationMessages(prev => prev.map(m =>
        m.message_id === messageId ? { ...m, pinned: response.data.pinned } : m
      ));
      toast.success(response.data.pinned ? 'Message pinned' : 'Message unpinned');
    } catch (error) {
      toast.error('Failed to pin message');
    }
  };

  const exportMessages = async (format = 'csv') => {
    try {
      const convParam = activeConversation ? `?conversation_id=${activeConversation.conversation_id}` : '';
      const response = await axios.get(`${API}/export/messages/${format}${convParam}`, {
        withCredentials: true,
        responseType: 'blob'
      });
      const ext = format === 'pdf' ? 'pdf' : 'csv';
      const mime = format === 'pdf' ? 'application/pdf' : 'text/csv';
      const url = window.URL.createObjectURL(new Blob([response.data], { type: mime }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `messages_${new Date().toISOString().split('T')[0]}.${ext}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success(`${format.toUpperCase()} exported!`);
    } catch (error) {
      toast.error('Failed to export');
    }
  };

  const saveAsTemplate = async () => {
    if (!messageToSave) {
      toast.error('No message selected to save');
      return;
    }
    if (!templateName.trim()) {
      toast.error('Template name is required');
      return;
    }
    if (templateName.trim().length > 100) {
      toast.error('Template name must be less than 100 characters');
      return;
    }
    try {
      await axios.post(`${API}/messages/${messageToSave}/save-template`, {
        name: templateName.trim(),
        category: templateCategory,
        mode: templateMode,
        thread_instructions: threadInstructions.trim()
      }, { withCredentials: true });
      fetchTemplates();
      setSaveTemplateDialog(false);
      setTemplateName('');
      setTemplateMode('exact');
      setThreadInstructions('');
      setMessageToSave(null);
      toast.success('Template saved successfully');
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error(error.response?.data?.detail || 'Failed to save template');
    }
  };

  const applyTemplate = (template) => {
    setCustomerMessage(template.customer_message);
    setTone(template.tone);
    setSuppressTemplateSuggestions(true);
    const mode = (template.mode || 'exact').toLowerCase();
    if (mode === 'pattern') {
      setAiResponse('');
      setActiveTemplateContext(template);
      toast.success(`Pattern template loaded: ${template.name}. Click Generate Response.`);
    } else {
      setAiResponse(template.ai_response);
      setActiveTemplateContext(null);
      toast.success(`Using exact template: ${template.name}`);
    }
    setShowTemplates(false);
  };

  const applyTemplateForThread = async (template) => {
    if (!activeConversation?.conversation_id) {
      toast.error('Open a conversation first to apply a thread template');
      return;
    }

    try {
      const response = await axios.patch(
        `${API}/conversations/${activeConversation.conversation_id}`,
        { thread_template_id: template.template_id },
        { withCredentials: true }
      );
      const updatedConversation = response.data.conversation;
      setActiveConversation(updatedConversation);
      setConversations((prev) => prev.map((conversation) => (
        conversation.conversation_id === updatedConversation.conversation_id
          ? { ...conversation, ...updatedConversation }
          : conversation
      )));
      setCustomerMessage(template.customer_message || customerMessage);
      setActiveTemplateContext(null);
      setSuppressTemplateSuggestions(true);
      setTone(template.tone || tone);
      setShowTemplates(false);
      toast.success(`Template applied to this thread: ${template.name}`);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to apply template to thread');
    }
  };

  const clearThreadTemplate = async () => {
    if (!activeConversation?.conversation_id) return;

    try {
      const response = await axios.patch(
        `${API}/conversations/${activeConversation.conversation_id}`,
        { clear_thread_template: true },
        { withCredentials: true }
      );
      const updatedConversation = response.data.conversation;
      setActiveConversation(updatedConversation);
      setConversations((prev) => prev.map((conversation) => (
        conversation.conversation_id === updatedConversation.conversation_id
          ? { ...conversation, ...updatedConversation }
          : conversation
      )));
      setActiveTemplateContext(null);
      setSuppressTemplateSuggestions(true);
      toast.success('Thread template cleared');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to clear thread template');
    }
  };

  const handleUserMessageEdit = (nextValue) => {
    // Manual mode: any user edit re-suppresses suggestions until explicitly requested.
    if (!suppressTemplateSuggestions && nextValue !== undefined) {
      setSuppressTemplateSuggestions(true);
    }
  };

  const enableTemplateSuggestions = () => {
    setSuppressTemplateSuggestions(false);
  };

  const deleteTemplate = async (templateId) => {
    const tmplToDelete = templates.find(t => t.template_id === templateId);
    setConfirmDialog({
      open: true,
      title: 'Delete Template',
      message: `Delete template "${tmplToDelete?.name || 'Untitled'}"?`,
      isLoading: false,
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isLoading: true }));
        try {
          await axios.delete(`${API}/templates/${templateId}`, { withCredentials: true });
          setTemplates(templates.filter(t => t.template_id !== templateId));
          toast.success('Template deleted');
          setConfirmDialog({ ...confirmDialog, open: false });
        } catch (error) {
          toast.error(error.response?.data?.detail || 'Failed to delete template');
          setConfirmDialog(prev => ({ ...prev, isLoading: false }));
        }
      }
    });
  };

  const createWebhook = async () => {
    if (!newWebhook.name?.trim()) {
      toast.error('Webhook name is required');
      return;
    }
    if (!newWebhook.url?.trim()) {
      toast.error('Webhook URL is required');
      return;
    }
    try {
      new URL(newWebhook.url);
    } catch {
      toast.error('Invalid webhook URL');
      return;
    }
    if (newWebhook.events.length === 0) {
      toast.error('Select at least one event');
      return;
    }
    setIsCreatingWebhook(true);
    try {
      await axios.post(`${API}/webhooks`, newWebhook, { withCredentials: true });
      fetchWebhooks();
      setNewWebhook({ name: '', url: '', events: [] });
      toast.success('Webhook created successfully');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create webhook');
    } finally {
      setIsCreatingWebhook(false);
    }
  };

  const deleteWebhook = async (webhookId) => {
    const whToDelete = webhooks.find(w => w.webhook_id === webhookId);
    setConfirmDialog({
      open: true,
      title: 'Delete Webhook',
      message: `Delete webhook "${whToDelete?.name || 'Untitled'}"? Events will no longer be sent to ${whToDelete?.url}.`,
      isLoading: false,
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isLoading: true }));
        try {
          await axios.delete(`${API}/webhooks/${webhookId}`, { withCredentials: true });
          setWebhooks(webhooks.filter(w => w.webhook_id !== webhookId));
          toast.success('Webhook deleted');
          setConfirmDialog({ ...confirmDialog, open: false });
        } catch (error) {
          toast.error(error.response?.data?.detail || 'Failed to delete webhook');
          setConfirmDialog(prev => ({ ...prev, isLoading: false }));
        }
      }
    });
  };

  const testWebhook = async (webhookId) => {
    try {
      const response = await axios.post(`${API}/webhooks/${webhookId}/test`, {}, { withCredentials: true });
      if (response.data.success) {
        toast.success(`Webhook test successful! Status: ${response.data.status_code}`);
      } else {
        toast.error(`Webhook test failed: ${response.data.error}`);
      }
    } catch (error) {
      toast.error('Failed to test webhook');
    }
  };

  const toggleWebhook = async (webhookId) => {
    try {
      const response = await axios.patch(`${API}/webhooks/${webhookId}/toggle`, {}, { withCredentials: true });
      setWebhooks(prev => prev.map(w => 
        w.webhook_id === webhookId ? { ...w, is_active: response.data.is_active } : w
      ));
      toast.success(response.data.is_active ? 'Webhook enabled' : 'Webhook disabled');
    } catch (error) {
      toast.error('Failed to toggle webhook');
    }
  };

  const fetchWebhookLogs = async (webhookId) => {
    try {
      const response = await axios.get(`${API}/webhooks/${webhookId}/logs`, { withCredentials: true });
      return response.data.logs || [];
    } catch (error) {
      toast.error('Failed to fetch webhook logs');
      return [];
    }
  };

  // ============ Channel / Inbox Handlers ============

  const createChannel = async (channelData) => {
    try {
      await axios.post(`${API}/channels`, channelData, { withCredentials: true });
      fetchChannels();
      toast.success('Channel connected!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to connect channel');
    }
  };

  const deleteChannel = async (channelId) => {
    setConfirmDialog({
      open: true,
      title: 'Disconnect Channel',
      message: 'This will remove the channel and stop receiving messages from it. Continue?',
      onConfirm: async () => {
        try {
          await axios.delete(`${API}/channels/${channelId}`, { withCredentials: true });
          setChannels(prev => prev.filter(c => c.channel_id !== channelId));
          toast.success('Channel disconnected');
        } catch (error) {
          toast.error('Failed to disconnect channel');
        }
        setConfirmDialog(prev => ({ ...prev, open: false }));
      }
    });
  };

  const toggleChannel = async (channelId, isActive) => {
    try {
      await axios.patch(`${API}/channels/${channelId}`, { is_active: isActive }, { withCredentials: true });
      setChannels(prev => prev.map(c =>
        c.channel_id === channelId ? { ...c, is_active: isActive } : c
      ));
      toast.success(isActive ? 'Channel enabled' : 'Channel disabled');
    } catch (error) {
      toast.error('Failed to toggle channel');
    }
  };

  const testChannelConnection = async (channelId) => {
    try {
      const res = await axios.post(`${API}/channels/${channelId}/test`, {}, { withCredentials: true });
      return res.data;
    } catch (error) {
      return { success: false, message: error.response?.data?.detail || 'Channel connection check failed' };
    }
  };

  const markInboxRead = async (messageId) => {
    try {
      await axios.patch(`${API}/inbox/${messageId}`, { status: 'read' }, { withCredentials: true });
      setInboxMessages(prev => prev.map(m =>
        m.inbox_message_id === messageId ? { ...m, status: 'read' } : m
      ));
      setUnreadTotal(prev => Math.max(0, prev - 1));
    } catch (error) {
      toast.error('Failed to mark as read');
    }
  };

  const archiveInboxMessage = async (messageId) => {
    try {
      await axios.patch(`${API}/inbox/${messageId}`, { status: 'archived' }, { withCredentials: true });
      setInboxMessages(prev => prev.filter(m => m.inbox_message_id !== messageId));
      toast.success('Message archived');
    } catch (error) {
      toast.error('Failed to archive');
    }
  };

  const replyToInboxMessage = async (msg, sendNow = false, replyText = null, mediaUrl = null) => {
    try {
      const payload = { send: sendNow, reply_text: replyText };
      if (mediaUrl) payload.media_url = mediaUrl;
      const response = await axios.post(
        `${API}/inbox/${msg.inbox_message_id}/reply`,
        payload,
        { withCredentials: true }
      );
      // Refresh inbox after reply
      fetchInbox(channelFilter, statusFilter);
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to send response');
      throw error;
    }
  };

  // Refresh inbox when filters change
  useEffect(() => {
    if (isAuthenticated && authType === 'user') {
      fetchInbox(channelFilter, statusFilter);
    }
  }, [channelFilter, statusFilter, isAuthenticated, authType, fetchInbox]);

  const handleCheckout = async (planKey) => {
    try {
      const response = await axios.post(`${API}/billing/checkout`, { plan: planKey }, { withCredentials: true });
      if (response.data.checkout_url) {
        window.location.href = response.data.checkout_url;
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to start checkout');
    }
  };

  const handleManageBilling = async () => {
    try {
      const response = await axios.post(`${API}/billing/portal`, {}, { withCredentials: true });
      if (response.data.portal_url) {
        window.location.href = response.data.portal_url;
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to open billing portal');
    }
  };

  const createTeam = async () => {
    try {
      await axios.post(`${API}/team/create`, {}, { withCredentials: true });
      fetchTeam();
      toast.success('Team created!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create team');
    }
  };

  const inviteTeamMember = async () => {
    if (!inviteEmail.trim()) {
      toast.error('Email address is required');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }
    try {
      await axios.post(`${API}/team/invite`, { email: inviteEmail.trim(), role: 'member' }, { withCredentials: true });
      fetchTeam();
      setInviteEmail('');
      toast.success(`Invitation sent to ${inviteEmail}`);
    } catch (error) {
      console.error('Error inviting team member:', error);
      toast.error(error.response?.data?.detail || 'Failed to send invitation');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleAssignConversation = async (conversationId, userId) => {
    try {
      await axios.post(`${API}/conversations/${conversationId}/assign`, 
        { user_id: userId }, 
        { withCredentials: true }
      );
      fetchConversations();
      toast.success(userId ? 'Conversation assigned' : 'Conversation unassigned');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to assign conversation');
    }
  };

  // --- Derived Data ---

  const tones = [
    { id: 'friendly', label: 'Friendly', color: 'emerald' },
    { id: 'professional', label: 'Professional', color: 'indigo' },
    { id: 'sales', label: 'Sales', color: 'rose' }
  ];

  const filteredMessages = chatSearch.trim()
    ? conversationMessages.filter(m =>
        m.customer_message?.toLowerCase().includes(chatSearch.toLowerCase()) ||
        m.ai_response?.toLowerCase().includes(chatSearch.toLowerCase())
      )
    : conversationMessages;

  const pinnedMessages = conversationMessages.filter(m => m.pinned);

  // --- Render ---

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center hero-gradient">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        profiles={profiles}
        activeProfile={activeProfile}
        authType={authType}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        onSwitchProfile={switchProfile}
        onCreateProfile={() => {
          setIsCreatingProfile(true);
          setIsEditingProfile(true);
          setProfileForm({ business_name: '', business_info: '', default_tone: 'friendly', contact_info: '', response_signature: '' });
        }}
        onExport={exportMessages}
        onShowCoaching={() => { setShowCoaching(true); fetchCoaching(); }}
        onShowAnalytics={() => { setShowAnalytics(true); fetchAnalytics(); }}
        onShowTeam={() => { setShowTeam(true); fetchTeam(); }}
        onShowWebhooks={() => { setShowWebhooks(true); fetchWebhooks(); }}
        onShowBilling={() => { setShowBilling(true); fetchSubscription(); }}
        onShowChannels={() => { setShowChannels(true); fetchChannels(); }}
        onShowInbox={() => { setActiveTab('inbox'); fetchInbox(channelFilter, statusFilter); }}
        onShowAIAgent={() => setActiveTab('ai-agent')}
        onShowAnalyticsPanel={() => setActiveTab('analytics')}
        onLogout={handleLogout}
        subscription={subscription}
        unreadTotal={unreadTotal}
        activeTab={activeTab}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-24 lg:pb-6">
        {/* Pending Invitations Banner */}
        {pendingInvitations.length > 0 && (
          <div className="mb-6 space-y-2">
            {pendingInvitations.map((inv) => (
              <div key={inv.invitation_id} className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-lg border border-primary/30 bg-primary/5">
                <Mail className="w-5 h-5 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">
                    Team invitation from {inv.invited_by_name || 'a team owner'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    You've been invited to join <span className="font-medium">{inv.team_name || 'a team'}</span> as {inv.role || 'member'}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0 w-full sm:w-auto">
                  <Button size="sm" onClick={() => acceptInvitation(inv.invitation_id)}>
                    <Check className="w-3 h-3 mr-1" /> Accept
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => declineInvitation(inv.invitation_id)}>
                    <X className="w-3 h-3 mr-1" /> Decline
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
        {activeTab === 'inbox' && (
          <InboxPanel
            inboxMessages={inboxMessages}
            unreadTotal={unreadTotal}
            unreadByChannel={unreadByChannel}
            channelFilter={channelFilter}
            onChannelFilter={setChannelFilter}
            statusFilter={statusFilter}
            onStatusFilter={setStatusFilter}
            onMarkRead={markInboxRead}
            onReply={replyToInboxMessage}
            onArchive={archiveInboxMessage}
            onBack={() => setActiveTab('generate')}
            onManageChannels={() => { setShowChannels(true); fetchChannels(); }}
          />
        )}

        {activeTab === 'ai-agent' && (
          <AIAgentPanel onBack={() => setActiveTab('generate')} />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsPanel onBack={() => setActiveTab('generate')} />
        )}

        <div className={`flex flex-col lg:flex-row gap-6 ${(activeTab === 'inbox' || activeTab === 'ai-agent' || activeTab === 'analytics') ? 'hidden' : ''}`}>
          {/* Sidebar */}
          <aside className={`lg:w-80 shrink-0 space-y-6 ${activeTab !== 'generate' ? 'block' : 'hidden lg:block'}`}>
            <BusinessProfileCard
              activeTab={activeTab}
              activeProfile={activeProfile}
              isEditingProfile={isEditingProfile}
              setIsEditingProfile={setIsEditingProfile}
              isCreatingProfile={isCreatingProfile}
              setIsCreatingProfile={setIsCreatingProfile}
              profileForm={profileForm}
              setProfileForm={setProfileForm}
              onSave={saveProfile}
              onDelete={deleteProfile}
              profileCount={profiles.length}
            />

            <ConversationList
              activeTab={activeTab}
              conversations={conversations}
              activeConversation={activeConversation}
              editingConvName={editingConvName}
              setEditingConvName={setEditingConvName}
              newConvName={newConvName}
              setNewConvName={setNewConvName}
              onLoad={loadConversation}
              onUpdateName={updateConversationName}
              onDelete={deleteConversation}
              onNew={startNewConversation}
              teamMembers={team?.members}
              onAssign={handleAssignConversation}
            />

            <RecentMessages
              messages={messages}
              onLoad={loadFromHistory}
              onSaveTemplate={(messageId) => {
                setMessageToSave(messageId);
                setSaveTemplateDialog(true);
              }}
              onDelete={deleteMessage}
            />
          </aside>

          {/* Main Generation Area */}
          <main className={`flex-1 space-y-6 ${activeTab !== 'generate' && 'hidden lg:block'}`}>
            <ConversationPanel
              activeConversation={activeConversation}
              customerName={customerName}
              conversationMessages={conversationMessages}
              pinnedMessages={pinnedMessages}
              filteredMessages={filteredMessages}
              chatExpanded={chatExpanded}
              setChatExpanded={setChatExpanded}
              chatSearch={chatSearch}
              setChatSearch={setChatSearch}
              showChatSearch={showChatSearch}
              setShowChatSearch={setShowChatSearch}
              chatEndRef={chatEndRef}
              onTogglePin={togglePinMessage}
              onNewConversation={startNewConversation}
              threadTemplate={activeThreadTemplate}
              onClearThreadTemplate={clearThreadTemplate}
            />

            <CustomerMessageInput
              customerMessage={customerMessage}
              setCustomerMessage={setCustomerMessage}
              customerName={customerName}
              setCustomerName={setCustomerName}
              tone={tone}
              setTone={setTone}
              tones={tones}
              showTemplates={showTemplates}
              setShowTemplates={setShowTemplates}
              isGenerating={isGenerating}
              onGenerate={generateResponse}
              onApplyTemplate={applyTemplate}
              suppressTemplateSuggestions={suppressTemplateSuggestions}
              onUserMessageEdit={handleUserMessageEdit}
              onEnableTemplateSuggestions={enableTemplateSuggestions}
              hasTemplates={templates.length > 0}
              userInstruction={userInstruction}
              setUserInstruction={setUserInstruction}
            />

            <TemplatesPanel
              show={showTemplates}
              templates={templates}
              onClose={() => setShowTemplates(false)}
              onApply={applyTemplate}
              onApplyForThread={applyTemplateForThread}
              onDelete={deleteTemplate}
              setTemplates={setTemplates}
              setAiResponse={setAiResponse}
              setShowTemplates={setShowTemplates}
              activeConversation={activeConversation}
            />

            <AIResponseCard
              aiResponse={aiResponse}
              tone={tone}
              currentRating={currentRating}
              copied={copied}
              onRate={rateResponse}
              onCopy={copyToClipboard}
              onSaveTemplate={() => {
                if (currentMessageId) {
                  setMessageToSave(currentMessageId);
                  setSaveTemplateDialog(true);
                }
              }}
            />

            {/* Empty State */}
            {!aiResponse && !isGenerating && (
              <div className="bg-card/50 rounded-xl border-2 border-dashed p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <ChevronRight className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold font-['Outfit'] text-lg mb-2">Ready to Generate</h3>
                <p className="text-muted-foreground text-sm max-w-md mx-auto">
                  Paste a customer inquiry above. The AI will intelligently determine the best response format based on the message content.
                </p>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-50 border-t bg-card/95 backdrop-blur px-2 pt-1 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <div className="grid grid-cols-5 gap-1">
          <button
            onClick={() => setActiveTab('generate')}
            className={`h-14 rounded-xl flex flex-col items-center justify-center text-[11px] ${activeTab === 'generate' ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}
          >
            <MessageSquare className="w-4 h-4 mb-1" />
            Generate
          </button>
          <button
            onClick={() => setActiveTab('conversations')}
            className={`h-14 rounded-xl flex flex-col items-center justify-center text-[11px] ${activeTab === 'conversations' ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}
          >
            <MessageCircle className="w-4 h-4 mb-1" />
            Chats
          </button>
          <button
            onClick={() => { setActiveTab('inbox'); fetchInbox(channelFilter, statusFilter); }}
            className={`h-14 rounded-xl relative flex flex-col items-center justify-center text-[11px] ${activeTab === 'inbox' ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}
          >
            <Inbox className="w-4 h-4 mb-1" />
            Inbox
            {unreadTotal > 0 && (
              <span className="absolute top-1 right-4 min-w-[16px] h-4 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center px-1">
                {unreadTotal > 99 ? '99+' : unreadTotal}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('ai-agent')}
            className={`h-14 rounded-xl flex flex-col items-center justify-center text-[11px] ${activeTab === 'ai-agent' ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}
          >
            <Bot className="w-4 h-4 mb-1" />
            AI
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`h-14 rounded-xl flex flex-col items-center justify-center text-[11px] ${activeTab === 'profile' ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}
          >
            <Settings className="w-4 h-4 mb-1" />
            Profile
          </button>
        </div>
      </div>

      {/* Dialogs */}
      <SaveTemplateDialog
        open={saveTemplateDialog}
        onOpenChange={setSaveTemplateDialog}
        templateName={templateName}
        setTemplateName={setTemplateName}
        templateCategory={templateCategory}
        setTemplateCategory={setTemplateCategory}
        templateMode={templateMode}
        setTemplateMode={setTemplateMode}
        threadInstructions={threadInstructions}
        setThreadInstructions={setThreadInstructions}
        onSave={saveAsTemplate}
      />

      <AnalyticsDialog
        open={showAnalytics}
        onOpenChange={setShowAnalytics}
        analytics={analytics}
      />

      <CoachingDialog
        open={showCoaching}
        onOpenChange={setShowCoaching}
        coaching={coaching}
        isLoading={isLoadingCoaching}
      />

      <TeamDialog
        open={showTeam}
        onOpenChange={setShowTeam}
        authType={authType}
        team={team}
        inviteEmail={inviteEmail}
        setInviteEmail={setInviteEmail}
        onCreateTeam={createTeam}
        onInvite={inviteTeamMember}
        onRefresh={fetchTeam}
      />

      <WebhooksDialog
        open={showWebhooks}
        onOpenChange={setShowWebhooks}
        webhooks={webhooks}
        newWebhook={newWebhook}
        setNewWebhook={setNewWebhook}
        onCreate={createWebhook}
        onDelete={deleteWebhook}
        onTest={testWebhook}
        onToggle={toggleWebhook}
        onFetchLogs={fetchWebhookLogs}
      />

      <BillingDialog
        open={showBilling}
        onOpenChange={setShowBilling}
        subscription={subscription}
        onCheckout={handleCheckout}
        onManage={handleManageBilling}
      />

      <ChannelsDialog
        open={showChannels}
        onOpenChange={setShowChannels}
        channels={channels}
        onCreateChannel={createChannel}
        onDeleteChannel={deleteChannel}
        onToggleChannel={toggleChannel}
        onTestConnection={testChannelConnection}
      />

      <ConfirmDialog
        confirmDialog={confirmDialog}
        setConfirmDialog={setConfirmDialog}
      />
    </div>
  );
};
