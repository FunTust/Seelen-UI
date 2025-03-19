import { BluetoothDevices, SeelenCommand } from '@seelen-ui/lib';
import { BluetoothDevice } from '@seelen-ui/lib/types';
import { invoke } from '@tauri-apps/api/core';
import { Tooltip } from 'antd';
import { PropsWithChildren, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import { BackgroundByLayersV2 } from '../../../../seelenweg/components/BackgroundByLayers/infra';

import { Selectors } from '../../shared/store/app';
import { Icon } from 'src/apps/shared/components/Icon';
import { useWindowFocusChange } from 'src/apps/shared/hooks';

import { AnimatedPopover } from '../../../../shared/components/AnimatedWrappers';
import { BluetoothSelectorEntry } from './BluetoothSelectorEntry';

function BluetoothSelector({ open }: { open: boolean }) {
  const [selected, setSelected] = useState<string | null>(null);

  const storeEntries: BluetoothDevice[] = useSelector(Selectors.bluetoothDevices);
  const entries: BluetoothDevice[] = storeEntries.filter(
    (item) =>
      !storeEntries.find(
        (current) =>
          current.name == item.name && current.id != item.id && !current.isBluetoothLoweenergy,
      ),
  );
  const connectedDevices = entries.filter((item) => item.connected);
  const disconnectedDevices = entries.filter((item) => !item.connected);
  const store_discovered_entries: BluetoothDevice[] = useSelector(
    Selectors.discoveredBluetoothDevices,
  );
  const discovered_entries = store_discovered_entries.filter(
    (item) =>
      !store_discovered_entries.find(
        (current) =>
          current.name == item.name && current.id != item.id && !current.isBluetoothLoweenergy,
      ),
  );

  const { t } = useTranslation();

  useEffect(() => {
    if (!open) {
      setSelected(null);
    }
  }, [open]);

  return (
    <BackgroundByLayersV2 className="bluetooth" onContextMenu={(e) => e.stopPropagation()}>
      {connectedDevices.length > 0 && (
        <>
          <div className="bluetooth-title">{t('bluetooth.connected')}</div>
          <div className="bluetooth-entries">
            {connectedDevices.map((item) => {
              return (
                <BluetoothSelectorEntry
                  key={item.name}
                  device={item}
                  selected={selected === item.id}
                  onClick={() => setSelected(item.id)}
                />
              );
            })}
          </div>
        </>
      )}

      {disconnectedDevices.length > 0 && (
        <>
          <div className="bluetooth-title">{t('bluetooth.paired')}</div>
          <div className="bluetooth-entries">
            {disconnectedDevices.map((item) => {
              return (
                <BluetoothSelectorEntry
                  key={item.name}
                  device={item}
                  selected={selected === item.id}
                  onClick={() => setSelected(item.id)}
                />
              );
            })}
          </div>
        </>
      )}

      <div className="bluetooth-title">
        <span>{t('bluetooth.available')}</span>
        <Tooltip title={t('bluetooth.scanning')}>
          <button className="bluetooth-refresh">
            <Icon iconName="TfiReload" size={12} />
          </button>
        </Tooltip>
      </div>
      <div className="bluetooth-entries">
        {discovered_entries.length ? (
          discovered_entries.map((item) => {
            return (
              <BluetoothSelectorEntry
                key={item.name}
                device={item}
                selected={selected === item.id}
                onClick={() => setSelected(item.id)}
              />
            );
          })
        ) : (
          <div className="bluetooth-empty">{t('bluetooth.not_found')}</div>
        )}
      </div>

      <div className="bluetooth-footer">
        <button
          className="bluetooth-footer-more-button"
          onClick={() => invoke(SeelenCommand.OpenFile, { path: 'ms-settings:devices' })}
        >
          {t('bluetooth.more')}
        </button>
      </div>
    </BackgroundByLayersV2>
  );
}

export interface BluetoothSelectorProperties extends PropsWithChildren {
  setActive: (value: boolean) => void;
}

export function WithBluetoothSelector({ setActive, children }: BluetoothSelectorProperties) {
  const [mounted, setMounted] = useState(false);
  const [openPreview, setOpenPreview] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) {
      return;
    }
    setActive(openPreview);

    if (openPreview) {
      BluetoothDevices.discover();
    } else {
      BluetoothDevices.stopDiscovery();
    }
  }, [openPreview]);

  useWindowFocusChange((focused) => {
    if (!focused) {
      setOpenPreview(false);
    }
  });

  return (
    <AnimatedPopover
      animationDescription={{
        maxAnimationTimeMs: 500,
        openAnimationName: 'bluetooth-open',
        closeAnimationName: 'bluetooth-close',
      }}
      open={openPreview}
      trigger="click"
      onOpenChange={setOpenPreview}
      arrow={false}
      content={<BluetoothSelector open={openPreview} />}
      destroyTooltipOnHide
    >
      {children}
    </AnimatedPopover>
  );
}
