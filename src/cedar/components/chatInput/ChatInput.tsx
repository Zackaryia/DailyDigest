import { cn, useCedarStore, HumanInTheLoopMessage } from 'cedar-os';

import { CedarEditorContent as EditorContent } from 'cedar-os';
import { SendHorizonal } from 'lucide-react';
import { motion } from 'motion/react';
import React, { useEffect } from 'react';

import './ChatInput.css';
import { ContextBadgeRow } from '@/cedar/components/chatInput/ContextBadgeRow';
import { useCedarEditor } from 'cedar-os';
import Container3DButton from '@/cedar/components/containers/Container3DButton';
import { KeyboardShortcut } from '@/cedar/components/ui/KeyboardShortcut';

// ChatContainer component with position options
export type ChatContainerPosition = 'bottom-center' | 'embedded' | 'custom';

// Inlined mention items removed; using external suggestion module

export const ChatInput: React.FC<{
	handleFocus?: () => void;
	handleBlur?: () => void;
	isInputFocused?: boolean;
	className?: string; // Additional classes for the container
	stream?: boolean; // Whether to use streaming for responses
}> = ({
	handleFocus,
	handleBlur,
	isInputFocused,
	className = '',
	stream = true,
}) => {
	const [isFocused, setIsFocused] = React.useState(false);

	const { editor, isEditorEmpty, handleSubmit } = useCedarEditor({
		onFocus: () => {
			setIsFocused(true);
			handleFocus?.();
		},
		onBlur: () => {
			setIsFocused(false);
			handleBlur?.();
		},
		stream,
	});

	// Get latest message to check for human-in-the-loop state
	const messages = useCedarStore((state) => state.messages);
	const latestMessage = messages[messages.length - 1];
	const isHumanInTheLoopSuspended =
		latestMessage?.type === 'humanInTheLoop' &&
		(latestMessage as HumanInTheLoopMessage).state === 'suspended';

	// Focus the editor when isInputFocused changes to allow for controlled focusing
	useEffect(() => {
		if (isInputFocused && editor) {
			editor.commands.focus();
		}
	}, [isInputFocused, editor]);

	// Handle tab key to focus the editor and escape to unfocus
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Tab') {
				e.preventDefault();
				if (editor) {
					editor.commands.focus();
					setIsFocused(true);
				}
			} else if (e.key === 'Escape') {
				if (isFocused && editor) {
					editor.commands.blur();
					setIsFocused(false);
				}
			}
		};

		// Add the event listener
		window.addEventListener('keydown', handleKeyDown);

		// Clean up
		return () => {
			window.removeEventListener('keydown', handleKeyDown);
		};
	}, [editor, isFocused]);


	return (
		<div
			className={cn(
				'bg-gray-800/10 dark:bg-gray-600/80 rounded-lg p-3 text-sm',
				className
			)}>
			{/* Input context row showing selected context nodes */}
			<ContextBadgeRow editor={editor} />

			{/* Chat editor row */}
			<div className='relative w-full h-fit' id='cedar-chat-input'>
				<div className='flex items-center gap-2'>
					{!isFocused && (
						<KeyboardShortcut
							shortcut='⇥'
							className='text-muted-foreground border-muted-foreground/30 flex-shrink-0'
						/>
					)}
					<motion.div
						layoutId='chatInput'
						className='flex-1 justify-center py-3'
						aria-label='Message input'>
						<EditorContent
							editor={editor}
							className='prose prose-sm max-w-none focus:outline-none outline-none focus:ring-0 ring-0 [&_*]:focus:outline-none [&_*]:outline-none [&_*]:focus:ring-0 [&_*]:ring-0 placeholder-gray-500 dark:placeholder-gray-400 [&_.ProseMirror]:p-0 [&_.ProseMirror]:outline-none [&_.ProseMirror]:break-words [&_.ProseMirror]:overflow-wrap-anywhere [&_.ProseMirror]:word-break-break-word'
						/>
					</motion.div>
				</div>
			</div>

			{/* Bottom row. Contains only send chat button */}
			<div
				id='input-tools'
				className='flex items-center justify-end'>
				<Container3DButton
					id='send-chat'
					motionProps={{
						layoutId: 'send-chat',
						animate: {
							opacity: isEditorEmpty ? 0.5 : 1,
							backgroundColor: isEditorEmpty ? 'transparent' : '#93c5fd',
						},
						transition: { type: 'spring', stiffness: 300, damping: 20 },
					}}
					onClick={() => handleSubmit()}
					color={isEditorEmpty ? undefined : '#93c5fd'}
					className='flex items-center flex-shrink-0 ml-auto -mt-0.5 rounded-full bg-white dark:bg-gray-800'
					childClassName='p-1.5'>
					<motion.div
						animate={{ rotate: isEditorEmpty ? 0 : -90 }}
						transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
						<SendHorizonal className='w-4 h-4' />
					</motion.div>
				</Container3DButton>
			</div>
		</div>
	);
};
