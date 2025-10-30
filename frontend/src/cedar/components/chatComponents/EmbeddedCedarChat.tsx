import { ChatInput } from '@/cedar/components/chatInput/ChatInput';
import FilteredChatBubbles from '../chatMessages/FilteredChatBubbles';
import { useCedarStore } from 'cedar-os';
import { X } from 'lucide-react';
import React from 'react';

// Helper function to format briefing data for AI context
const formatBriefingContext = (briefingData: BriefingData): string => {
	const { date, topics } = briefingData;
	
	let context = `Daily Briefing (${date}):\n\n`;

	topics.forEach((topic, index) => {
		context += `${index + 1}. ${topic.title}\n`;
		context += `${topic.summary}\n`;
		
		// Limit articles to first 3 to reduce context size
		const limitedArticles = topic.articles.slice(0, 3);
		if (limitedArticles.length > 0) {
			context += `Articles: `;
			context += limitedArticles.map(article => `${article.title} (${article.source})`).join('; ');
			context += '\n';
		}
		
		context += '\n';
	});
	
	context += `You are an AI assistant for discussing this briefing. Answer questions about these topics, provide insights, and help users understand the news. Be conversational and helpful.`;
	
	return context;
};

interface BriefingTopic {
	title: string;
	summary: string;
	articles: Array<{
		title: string;
		source: string;
		url: string;
	}>;
}

interface BriefingData {
	date: string;
	topics: BriefingTopic[];
}

interface EmbeddedCedarChatProps {
	title?: string;
	companyLogo?: React.ReactNode;
	showHeader?: boolean;
	showCloseButton?: boolean;
	onClose?: () => void;
	stream?: boolean; // Whether to use streaming for responses
	className?: string;
	briefingData?: BriefingData; // Add briefing data prop
}

export const EmbeddedCedarChat: React.FC<EmbeddedCedarChatProps> = ({
	title = 'Cedar Chat',
	companyLogo,
	showHeader = true,
	showCloseButton = false,
	onClose,
	stream = true,
	className = '',
	briefingData,
}) => {
	const setShowChat = useCedarStore((state) => state.setShowChat);
	const addMessage = useCedarStore((state) => state.addMessage);
	const messages = useCedarStore((state) => state.messages);

	// Track if context has been added to avoid duplicates
	const [contextAdded, setContextAdded] = React.useState(false);

	// Initialize AI with briefing context when component mounts
	React.useEffect(() => {
		if (briefingData && !contextAdded) {
			const contextMessage = formatBriefingContext(briefingData);
			const contextId = `briefing-context-${Date.now()}`;
			
			console.log('🔄 Adding briefing context to chat:', {
				topicsCount: briefingData.topics.length,
				date: briefingData.date,
				contextLength: contextMessage.length,
				contextId: contextId
			});
			
			// Add system message with briefing context
			addMessage({
				id: contextId,
				role: 'system',
				content: contextMessage,
				type: 'text',
				timestamp: new Date(),
			});

			setContextAdded(true);
			console.log('✅ Briefing context added as system message');

			// Add a welcome message from the assistant
			// setTimeout(() => {
			// 	addMessage({
			// 		id: `welcome-${Date.now()}`,
			// 		role: 'assistant',
			// 		content: `Hello! I'm here to help you discuss today's briefing from ${briefingData.date}. I have context about all ${briefingData.topics.length} topics covered today:\n\n${briefingData.topics.map((topic, i) => `${i + 1}. ${topic.title}`).join('\n')}\n\nFeel free to ask me questions about any of these topics, request deeper analysis, or explore connections between different stories. What would you like to discuss?`,
			// 		type: 'text',
			// 		timestamp: new Date(),
			// 	});
			// }, 500);
		} else if (!briefingData) {
			console.log('⚠️ No briefing data available for AI context');
		}
	}, [briefingData, addMessage, contextAdded]);

	const handleClose = () => {
		if (onClose) {
			onClose();
		} else {
			setShowChat(false);
		}
	};

	return (
		<div className={`rounded-lg border bg-card text-card-foreground shadow-sm border-border ${className}`}>
			{/* Header */}
			{showHeader && (
				<div className="flex flex-col space-y-1.5 p-6">
					<div className="flex items-center justify-between">
						<div className="flex items-center space-x-2">
							{companyLogo && (
								<div className="flex-shrink-0">{companyLogo}</div>
							)}
							<h3 className="font-semibold tracking-tight text-xl text-foreground">{title}</h3>
						</div>
						{showCloseButton && (
							<button
								className="p-1.5 hover:bg-muted rounded-md transition-colors"
								onClick={handleClose}
								aria-label="Close chat">
								<X className="h-4 w-4" />
							</button>
						)}
					</div>
				</div>
			)}

			{/* Chat messages - takes up remaining space */}
			<div className="flex-1 min-h-0 overflow-hidden px-6">
				<FilteredChatBubbles />
			</div>

			{/* Chat input - fixed at bottom */}
			<div className="p-6 pt-0 border-t border-border">
				<ChatInput
					handleFocus={() => {}}
					handleBlur={() => {}}
					isInputFocused={false}
					stream={stream}
					className="bg-transparent border-0 p-0"
				/>
			</div>
		</div>
	);
};
