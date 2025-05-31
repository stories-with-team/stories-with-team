import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import StoryBoard from '../../app/ui/StoryBoard';

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: 'ui/StoryBoard',
  component: StoryBoard,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: 'centered',
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ['autodocs'],
} satisfies Meta<typeof StoryBoard>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Primary: Story = {
  args: {
    storyMap: {
      title: 'Sample Story Map',
      storyList: [
        {
          id: '1',
          activity: {
            id: '1a',
            description: 'Activity 1 Description',
          },
          details: [
            { id: '1d1', description: 'Detail 1 for Activity 1' },              
            { id: '1d2', description: 'Detail 2 for Activity 1' },
            { id: '1d3', description: 'Detail 3 for Activity 1' },
          ],
        },
        {
          id: '2',
          activity: {
            id: '2a',
            description: 'Activity 2 Description',
          },
          details: [
            { id: '2d1', description: 'Detail 1 for Activity 2' },
            { id: '2d2', description: 'Detail 2 for Activity 2' },
          ],
        },
      ],
    },    
  }
};
