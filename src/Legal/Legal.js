import React from 'react';
import { Tabs, Text } from '@mantine/core';
import Terms from './Terms';
import Privacy from './Privacy';

import ReportContact from './ReportContact';
import './Legal.css';
function Legal() {
  return (
    <div className='legal'>
      <Tabs defaultValue="privacy-policy" color="green">
        <Tabs.List grow>
          <Tabs.Tab value="privacy-policy">
            <Text size="sm" style={{ color: '#555' }}>Privacy Policy</Text>
          </Tabs.Tab>
          <Tabs.Tab value="terms-conditions">
            <Text size="sm" style={{ color: '#555' }}>Terms and Conditions</Text>
          </Tabs.Tab>
          <Tabs.Tab value="contact-report">
            <Text size="sm" style={{ color: '#555' }}>Contact / Report an Issue</Text>
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="privacy-policy">
          <Privacy />
        </Tabs.Panel>
        <Tabs.Panel value="terms-conditions">
          <Terms />
        </Tabs.Panel>
        <Tabs.Panel value="contact-report">
          <ReportContact />
        </Tabs.Panel>
      </Tabs>
    </div>
  );
}

export default Legal;
